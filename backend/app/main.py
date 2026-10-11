from datetime import datetime, timezone
from pathlib import Path
import json, sqlite3, uuid
from typing import Literal, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

DB = Path(__file__).resolve().parent.parent / "agriagent.db"
app = FastAPI(title="AgriAgent Africa API", version="0.1.0",
              description="Demo API for cited advisory drafts, officer review, and audit logs.")


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://agriagent-africa-frontend.onrender.com",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

DEMO = {
 "HH-DEMO-001": {
  "household_id":"HH-DEMO-001","field_name":"Demo maize plot",
  "data_status":"SYNTHETIC DEMO DATA — not a real household or live observation",
  "rainfall_7d_mm":4.0,"rainfall_source":"Synthetic demo rainfall record","rainfall_date":"2026-10-01",
  "soil_moisture_pct":18.0,"soil_moisture_source":"Synthetic demo reading; no sensor connected","soil_moisture_date":"2026-10-07",
  "crop":"maize","growth_stage":"vegetative",
  "market_price_kes_per_kg":42.0,"market_source":"Illustrative price only; not a verified quote","market_date":"2026-10-07",
  "satellite_status":"NOT CONNECTED","satellite_note":"No satellite observation was fetched."
 }}
def now(): return datetime.now(timezone.utc).isoformat()
def db():
 c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c
with db() as c:
 c.execute("CREATE TABLE IF NOT EXISTS advisories (id TEXT PRIMARY KEY, household_id TEXT, status TEXT, draft_json TEXT, created_at TEXT, officer_name TEXT, reviewed_at TEXT, review_note TEXT)")
 c.execute("CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, actor TEXT, action TEXT, input_json TEXT, output_json TEXT, outcome TEXT)")
def log(actor, action, inputs, outputs, outcome="success"):
 with db() as c:
  c.execute("INSERT INTO audit(timestamp,actor,action,input_json,output_json,outcome) VALUES(?,?,?,?,?,?)",
   (now(),actor,action,json.dumps(inputs),json.dumps(outputs),outcome))
class Review(BaseModel):
 officer_name: str = Field(min_length=2,max_length=120)
 decision: Literal["approve","edit","reject"]
 review_note: str = Field(min_length=2,max_length=2000)
 edited_advisory: Optional[str] = Field(default=None,max_length=4000)
@app.get("/health")
def health(): return {"status":"ok","data_mode":"synthetic demo records"}
@app.get("/evidence/{household_id}")
def evidence(household_id:str):
 e=DEMO.get(household_id)
 if not e:
  log("system","retrieve_evidence",{"household_id":household_id},{"error":"not found"},"failed")
  raise HTTPException(404,"Demo record not found. Use HH-DEMO-001.")
 log("system","retrieve_evidence",{"household_id":household_id},e); return e
def make_draft(e):
 score=0; reasons=[]
 if e["rainfall_7d_mm"] < 10:
  score+=1; reasons.append(f"7-day rainfall {e['rainfall_7d_mm']} mm (<10 mm demo threshold); source: {e['rainfall_source']}, dated {e['rainfall_date']}.")
 if e["soil_moisture_pct"] < 25:
  score+=1; reasons.append(f"Soil moisture {e['soil_moisture_pct']}% (<25% demo threshold); source: {e['soil_moisture_source']}, dated {e['soil_moisture_date']}.")
 return {"title":f"Draft advisory for {e['field_name']}","risk_level":"elevated" if score==2 else "watch" if score==1 else "lower",
  "risk_score":score,"score_note":"Transparent rule-based demo score, not a trained or validated ML prediction.",
  "recommendation":"Ask the farmer to verify soil moisture and consult the local extension officer before deciding whether irrigation is appropriate. Check crop stage, water availability, and forecast before action." if score else "Continue routine monitoring and reassess after the next rainfall or soil-moisture observation.",
  "evidence":reasons,"limitations":["All household records are synthetic demo data.","Market price is illustrative, not a verified current quote.","Satellite data is not connected; no pest/disease diagnosis is made."],
  "requires_officer_approval":True,"external_message_sent":False}
@app.post("/advisories/draft/{household_id}")
def draft(household_id:str):
 e=DEMO.get(household_id)
 if not e: raise HTTPException(404,"Demo record not found. Use HH-DEMO-001.")
 d=make_draft(e); aid=str(uuid.uuid4()); result={"id":aid,"household_id":household_id,"status":"pending_review","draft":d}
 with db() as c: c.execute("INSERT INTO advisories(id,household_id,status,draft_json,created_at) VALUES(?,?,?,?,?)",(aid,household_id,"pending_review",json.dumps(d),now()))
 log("agent","draft_advisory",{"household_id":household_id,"evidence":e},result); return result
@app.get("/advisories")
def advisories():
 with db() as c: rows=c.execute("SELECT * FROM advisories ORDER BY created_at DESC").fetchall()
 return [{"id":r["id"],"household_id":r["household_id"],"status":r["status"],"draft":json.loads(r["draft_json"]),"created_at":r["created_at"],"officer_name":r["officer_name"],"reviewed_at":r["reviewed_at"],"review_note":r["review_note"]} for r in rows]
@app.post("/advisories/{advisory_id}/review")
def review(advisory_id:str, req:Review):
 with db() as c:
  r=c.execute("SELECT * FROM advisories WHERE id=?",(advisory_id,)).fetchone()
  if not r: raise HTTPException(404,"Advisory not found.")
  if r["status"]!="pending_review": raise HTTPException(409,"This advisory has already been reviewed.")
  status={"approve":"approved_by_officer","edit":"edited_by_officer","reject":"rejected_by_officer"}[req.decision]
  d=json.loads(r["draft_json"])
  if req.decision=="edit":
   if not req.edited_advisory: raise HTTPException(422,"Provide edited_advisory when decision is edit.")
   d["recommendation"]=req.edited_advisory
  c.execute("UPDATE advisories SET status=?,draft_json=?,officer_name=?,reviewed_at=?,review_note=? WHERE id=?",(status,json.dumps(d),req.officer_name,now(),req.review_note,advisory_id))
 result={"id":advisory_id,"status":status,"officer_name":req.officer_name,"review_note":req.review_note,"external_message_sent":False,"note":"Review recorded only; no SMS or external action was performed."}
 log(req.officer_name,"review_advisory",{"advisory_id":advisory_id,"decision":req.decision,"review_note":req.review_note,"edited_advisory":req.edited_advisory},result)
 return result
@app.get("/audit")
def audit(limit:int=100):
 limit=max(1,min(limit,500))
 with db() as c: rows=c.execute("SELECT * FROM audit ORDER BY id DESC LIMIT ?",(limit,)).fetchall()
 return [dict(r) for r in rows]
