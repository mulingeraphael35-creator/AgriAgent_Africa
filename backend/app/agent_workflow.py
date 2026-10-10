
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import TypedDict, Any


from langgraph.graph import StateGraph, START, END
from langchain_ollama import ChatOllama
from langchain_mcp_adapters.client import MultiServerMCPClient

import asyncio
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import TypedDict, Any




class AgentState(TypedDict, total=False):
    household_id: str
    evidence: dict[str, Any]
    model_draft: dict[str, Any]
    advisory_result: dict[str, Any]
    error: str


llm = ChatOllama(
    model="qwen2.5:3b",
    temperature=0,
)



async def retrieve_evidence(state: AgentState) -> dict:
    client = MultiServerMCPClient(
        {
            "agriagent": {
                "transport": "stdio",
               
"command": str(Path(__file__).resolve().parents[2] / ".venv312" / "Scripts" / "python.exe"),

                "args": ["-m", "app.mcp_server"],
            }
        }
    )

    tools = await client.get_tools()
    evidence_tool = next(
        (tool for tool in tools if tool.name == "get_household_evidence"),
        None,
    )

    if evidence_tool is None:
        return {"error": "MCP tool get_household_evidence was not found."}

    result = await evidence_tool.ainvoke(
        {"household_id": state["household_id"]}
    )

    if isinstance(result, dict) and "error" in result:
        return {"error": result["error"]}

    if isinstance(result, str):
        import json
        try:
            result = json.loads(result)
        except json.JSONDecodeError:
            return {"error": "MCP returned evidence in an unexpected format."}

    return {"evidence": result}



def generate_recommendation(state: AgentState) -> dict:
    if state.get("error"):
        return {}

    evidence = state["evidence"]

    prompt = f"""
You are AgriAgent Africa, an agricultural advisory drafting assistant.

Use only the evidence in the JSON below. It is synthetic demo data,
not verified information about a real farmer.

Rules:
- Do not invent observations, dates, prices, sources, or measurements.
- Do not claim the market price is live or verified.
- If evidence is insufficient, say verification is needed.
- Make a cautious recommendation, not a guarantee.
- The draft must be reviewed by a named local extension officer.
- Do not send messages, place orders, or request loans.

- Do not recommend fertilizer, pesticides, or purchased inputs unless the supplied evidence supports that specific recommendation.
- Low soil moisture alone does not prove a nutrient deficiency or justify applying fertilizer.
- Prefer monitoring, verification, and consultation when evidence is insufficient.

- Include supporting evidence using the exact source names and dates.
- Return valid JSON only, with these keys:
  recommendation (string),
  supporting_evidence (array of strings),
  data_warning (string).

Farm evidence:
{json.dumps(evidence, indent=2)}
"""

    response = llm.invoke(prompt)

    try:
        content = response.content
        if not isinstance(content, str):
            raise ValueError("Model response was not text.")

        start = content.find("{")
        end = content.rfind("}") + 1
        if start < 0 or end <= start:
            raise ValueError("Model did not return a JSON object.")

        result = json.loads(content[start:end])

        if not isinstance(result.get("recommendation"), str):
            raise ValueError("Missing recommendation.")
        if not isinstance(result.get("supporting_evidence"), list):
            raise ValueError("Missing supporting evidence list.")
        if not isinstance(result.get("data_warning"), str):
            raise ValueError("Missing data warning.")

        # Preserve source facts and dates in the final evidence list.
        result["supporting_evidence"] = [

            f"{evidence['rainfall_7d_mm']} mm rainfall in 7 days.",
            f"{evidence['soil_moisture_source']} "
            f"({evidence['soil_moisture_date']}): "
            f"{evidence['soil_moisture_pct']}% soil moisture.",
            f"{evidence['market_source']} ({evidence['market_date']}): "
            f"KES {evidence['market_price_kes_per_kg']}/kg "
            "(illustrative, not a verified live quote).",
        ]

        result["data_warning"] = (
            "Synthetic demo observations only; no sensor is connected. "
            "The market price is illustrative, not a verified live quote. "
            "Verify conditions with the local extension officer."
        )

        return {"model_draft": result}

    except (ValueError, json.JSONDecodeError) as exc:
        return {"error": f"Could not validate Qwen's draft: {exc}"}



def save_draft(state: AgentState) -> dict:
    """Save Qwen's draft for officer review; never dispatch it."""
    if state.get("error"):
        return {}

    evidence = state["evidence"]
    model_draft = state["model_draft"]
    recommendation = model_draft["recommendation"]

    # Replace unsupported input advice with a safer verification step.
    unsupported_terms = (
        "foliar fertilizer",
        "apply fertilizer",
        "buy fertilizer",
        "purchase pesticide",
        "apply pesticide",
    )

    if any(term in recommendation.lower() for term in unsupported_terms):
        recommendation = (
            "Verify crop condition and soil moisture with the local "
            "extension officer before deciding whether any treatment "
            "or farm input is needed."
        )

    advisory_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    draft = {
        "household_id": state["household_id"],
        "field_name": evidence["field_name"],
        "risk_level": "watch",
        "recommendation": recommendation,
        "supporting_evidence": model_draft["supporting_evidence"],
        "data_warning": model_draft["data_warning"],
        "requires_named_officer_approval": True,
        "external_message_sent": False,
        "input_order_placed": False,
        "loan_requested": False,
        "generated_by": "qwen2.5:3b",
    }

    db_path = Path(__file__).resolve().parent.parent / "agriagent.db"

    try:
        with sqlite3.connect(db_path) as conn:
            conn.execute(
                """
                INSERT INTO advisories
                (id, household_id, status, draft_json, created_at,
                 officer_name, reviewed_at, review_note)
                VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL)
                """,
                (
                    advisory_id,
                    state["household_id"],
                    "pending_review",
                    json.dumps(draft),
                    created_at,
                ),
            )

        result = {
            "id": advisory_id,
            "household_id": state["household_id"],
            "status": "pending_review",
            "draft": draft,
        }

        record_audit(
            "agent",
            "qwen_advisory_draft",
            {"household_id": state["household_id"], "evidence": evidence},
            result,
        )

        return {"advisory_result": result}

    except sqlite3.Error as exc:
        return {"error": f"Could not save Qwen draft: {exc}"}

    if state.get("error"):
        return {}

    # The existing MCP function saves its own rule-based draft.
    # Do not create a second record until the persistence path is
    # updated to accept and validate the model-generated draft.
    return {
        "error": (
            "Qwen draft generated but not saved yet. "
            "The persistence function must accept the model draft "
            "before it can be safely stored."
        )
    }


def route_after_evidence(state: AgentState) -> str:
    return "stop" if state.get("error") else "generate"


def route_after_generation(state: AgentState) -> str:
    return "stop" if state.get("error") else "save"


builder = StateGraph(AgentState)

builder.add_node("retrieve", retrieve_evidence)
builder.add_node("generate", generate_recommendation)
builder.add_node("save", save_draft)
builder.add_node("stop", lambda state: {})

builder.add_edge(START, "retrieve")
builder.add_conditional_edges(
    "retrieve",
    route_after_evidence,
    {"generate": "generate", "stop": "stop"},
)
builder.add_conditional_edges(
    "generate",
    route_after_generation,
    {"save": "save", "stop": "stop"},
)
builder.add_edge("save", END)
builder.add_edge("stop", END)

graph = builder.compile()


if __name__ == "__main__":
    result = asyncio.run(
        graph.ainvoke({"household_id": "HH-DEMO-001"})
    )
    print(json.dumps(result, indent=2))


    result = graph.invoke({"household_id": "HH-DEMO-001"})
    print(json.dumps(result, indent=2))
