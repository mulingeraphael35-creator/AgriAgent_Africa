
import json
import sqlite3
import uuid
from pathlib import Path
from datetime import datetime, timezone

from mcp.server.fastmcp import FastMCP

DB = Path(__file__).resolve().parent.parent / "agriagent.db"
mcp = FastMCP("AgriAgent Africa")

DEMO_HOUSEHOLD = {
    "household_id": "HH-DEMO-001",
    "field_name": "Demo maize plot",
    "data_status": "Synthetic demo data - not a real household",
    "rainfall_7d_mm": 4.0,
    "rainfall_source": "Synthetic demo rainfall record",
    "rainfall_date": "2026-10-01",
    "soil_moisture_pct": 18.0,
    "soil_moisture_source": (
        "Synthetic demo reading; no sensor connected"
    ),
    "soil_moisture_date": "2026-10-07",
    "crop": "maize",
    "growth_stage": "vegetative",
    "market_price_kes_per_kg": 42.0,
    "market_source": "Illustrative price, not a verified quote",
    "market_date": "2026-10-07",
}


def timestamp():
    return datetime.now(timezone.utc).isoformat()


def record_audit(actor, action, inputs, outputs, outcome="success"):
    """Record tool activity in the existing audit database."""
    with sqlite3.connect(DB) as conn:
        conn.execute(
            """
            INSERT INTO audit
            (timestamp, actor, action, input_json, output_json, outcome)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                timestamp(),
                actor,
                action,
                json.dumps(inputs),
                json.dumps(outputs),
                outcome,
            ),
        )


@mcp.tool()
def get_household_evidence(household_id: str) -> dict:
    """Retrieve dated demo rainfall, soil, crop, and market evidence."""
    if household_id != DEMO_HOUSEHOLD["household_id"]:
        result = {"error": "Demo household not found. Use HH-DEMO-001."}
        record_audit(
            "mcp_user", "get_household_evidence",
            {"household_id": household_id}, result, "failed"
        )
        return result

    result = dict(DEMO_HOUSEHOLD)
    record_audit(
        "mcp_user", "get_household_evidence",
        {"household_id": household_id}, result
    )
    return result


@mcp.tool()
def draft_advisory(household_id: str) -> dict:
    """Save an evidence-backed draft for officer review; never send it."""
    if household_id != DEMO_HOUSEHOLD["household_id"]:
        result = {"error": "Demo household not found. Use HH-DEMO-001."}
        record_audit(
            "agent", "draft_advisory",
            {"household_id": household_id}, result, "failed"
        )
        return result

    evidence = dict(DEMO_HOUSEHOLD)
    reasons = []

    if evidence["rainfall_7d_mm"] < 10:
        reasons.append(
            f"7-day rainfall: {evidence['rainfall_7d_mm']} mm; "
            f"below the demo threshold of 10 mm. "
            f"Source: {evidence['rainfall_source']}; "
            f"date: {evidence['rainfall_date']}."
        )

    if evidence["soil_moisture_pct"] < 25:
        reasons.append(
            f"Soil moisture: {evidence['soil_moisture_pct']}%; "
            f"below the demo threshold of 25%. "
            f"Source: {evidence['soil_moisture_source']}; "
            f"date: {evidence['soil_moisture_date']}."
        )

    advisory_id = str(uuid.uuid4())
    draft = {
        "household_id": household_id,
        "field_name": evidence["field_name"],
        "risk_level": "elevated" if len(reasons) == 2 else "watch",
        "recommendation": (
            "Verify soil moisture and consult the local agricultural "
            "extension officer before deciding on irrigation. Check "
            "crop stage, available water, and the current forecast."
        ),
        "supporting_evidence": reasons,
        "data_warning": (
            "All household observations are synthetic demo data. "
            "The market price is illustrative, not a verified live quote."
        ),
        "requires_named_officer_approval": True,
        "external_message_sent": False,
        "input_order_placed": False,
        "loan_requested": False,
    }

    result = {
        "id": advisory_id,
        "household_id": household_id,
        "status": "pending_review",
        "draft": draft,
    }

    try:
        with sqlite3.connect(DB) as conn:
            conn.execute(
                """
                INSERT INTO advisories
                (id, household_id, status, draft_json, created_at,
                 officer_name, reviewed_at, review_note)
                VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL)
                """,
                (
                    advisory_id,
                    household_id,
                    "pending_review",
                    json.dumps(draft),
                    timestamp(),
                ),
            )
        record_audit(
            "agent", "draft_advisory",
            {"household_id": household_id, "evidence": evidence},
            result,
        )
        return result
    except sqlite3.Error as exc:
        error = {"error": f"Could not save advisory: {exc}"}
        record_audit(
            "agent", "draft_advisory",
            {"household_id": household_id}, error, "failed"
        )
        return error


@mcp.tool()
def review_advisory(
    advisory_id: str,
    officer_name: str,
    decision: str,
    review_note: str,
    edited_recommendation: str = "",
) -> dict:
    """Record a named officer's decision; never dispatch advice or orders."""
    if len(officer_name.strip()) < 2:
        return {"error": "A named officer is required."}

    if decision not in {"approve", "edit", "reject"}:
        return {"error": "Decision must be approve, edit, or reject."}

    if len(review_note.strip()) < 2:
        return {"error": "A review note is required."}

    if decision == "edit" and len(edited_recommendation.strip()) < 2:
        return {
            "error": "Provide the edited recommendation when decision is edit."
        }

    try:
        with sqlite3.connect(DB) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                "SELECT * FROM advisories WHERE id = ?",
                (advisory_id,),
            ).fetchone()

            if row is None:
                result = {"error": "Advisory ID not found."}
                record_audit(
                    officer_name.strip(), "review_advisory",
                    {"advisory_id": advisory_id, "decision": decision},
                    result, "failed"
                )
                return result

            if row["status"] != "pending_review":
                result = {
                    "error": (
                        "This advisory has already been reviewed or "
                        "has an unexpected status."
                    ),
                    "current_status": row["status"],
                }
                record_audit(
                    officer_name.strip(), "review_advisory",
                    {"advisory_id": advisory_id, "decision": decision},
                    result, "failed"
                )
                return result

            draft = json.loads(row["draft_json"])

            if decision == "edit":
                draft["recommendation"] = edited_recommendation.strip()

            status_map = {
                "approve": "approved_by_officer",
                "edit": "edited_by_officer",
                "reject": "rejected_by_officer",
            }
            reviewed_at = timestamp()
            officer = officer_name.strip()
            note = review_note.strip()

            conn.execute(
                """
                UPDATE advisories
                SET status = ?, draft_json = ?, officer_name = ?,
                    reviewed_at = ?, review_note = ?
                WHERE id = ? AND status = 'pending_review'
                """,
                (
                    status_map[decision],
                    json.dumps(draft),
                    officer,
                    reviewed_at,
                    note,
                    advisory_id,
                ),
            )

        result = {
            "id": advisory_id,
            "household_id": row["household_id"],
            "status": status_map[decision],
            "decision": decision,
            "officer_name": officer,
            "review_note": note,
            "reviewed_at": reviewed_at,
            "external_message_sent": False,
            "input_order_placed": False,
            "loan_requested": False,
            "note": (
                "Decision saved. No advice was sent to a farmer, "
                "and no order or loan request was placed."
            ),
        }
        record_audit(
            officer, "review_advisory",
            {
                "advisory_id": advisory_id,
                "decision": decision,
                "review_note": note,
                "edited_recommendation": edited_recommendation,
            },
            result,
        )
        return result

    except (sqlite3.Error, json.JSONDecodeError) as exc:
        result = {"error": f"Could not review advisory: {exc}"}
        record_audit(
            officer_name.strip(), "review_advisory",
            {"advisory_id": advisory_id, "decision": decision},
            result, "failed"
        )
        return result


if __name__ == "__main__":
    mcp.run()
