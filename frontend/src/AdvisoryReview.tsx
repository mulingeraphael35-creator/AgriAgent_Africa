import { useCallback, useEffect, useState } from "react";
import { RefreshCw, FileSearch, AlertTriangle, ClipboardList, CheckCircle2, XCircle, PencilLine } from "lucide-react";
import "./AdvisoryReview.css";
const API = "https://agriagent-africa.onrender.com";
//const API="http://127.0.0.1:8000";
type Evidence={household_id:string;field_name:string;data_status:string;rainfall_7d_mm:number;rainfall_source:string;rainfall_date:string;soil_moisture_pct:number;soil_moisture_source:string;soil_moisture_date:string;crop:string;growth_stage:string;market_price_kes_per_kg:number;market_source:string;market_date:string;satellite_status:string;satellite_note:string};
type Draft={title:string;risk_level:string;risk_score:number;score_note:string;recommendation:string;evidence:string[];limitations:string[];requires_officer_approval:boolean;external_message_sent:boolean};
type Advisory={id:string;household_id:string;status:string;draft:Draft;created_at:string;officer_name?:string|null;reviewed_at?:string|null;review_note?:string|null};
type Audit={id:number;timestamp:string;actor:string;action:string;outcome:string};
async function api<T>(path:string,init?:RequestInit):Promise<T>{const r=await fetch(API+path,{...init,headers:{"Content-Type":"application/json",...(init?.headers??{})}});const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b.detail??`Request failed (${r.status})`);return b as T}
export default function AdvisoryReview(){const[e,setE]=useState<Evidence|null>(null);const[a,setA]=useState<Advisory[]>([]);const[l,setL]=useState<Audit[]>([]);const[busy,setBusy]=useState(false);const[loading,setLoading]=useState(false);const[err,setErr]=useState("");const[officer,setOfficer]=useState("");const[decision,setDecision]=useState<"approve"|"edit"|"reject">("approve");const[note,setNote]=useState("");const[edited,setEdited]=useState("");
const refresh=useCallback(async()=>{setLoading(true);setErr("");try{const[x,y,z]=await Promise.all([api<Evidence>("/evidence/HH-DEMO-001"),api<Advisory[]>("/advisories"),api<Audit[]>("/audit")]);setE(x);setA(y);setL(z)}catch(x){setErr(x instanceof Error?x.message:"Could not connect. Is the backend running?")}finally{setLoading(false)}},[]);
useEffect(()=>{void refresh()},[refresh]);

async function create() {
  if (a.some((item) => item.status === "pending_review")) {
    setErr("A draft is already awaiting officer review. Review it before generating another.");
    return;
  }

  setBusy(true);
  setErr("");

  try {
    await api("/advisories/draft/HH-DEMO-001", { method: "POST" });
    await refresh();
  } catch (x) {
    setErr(x instanceof Error ? x.message : "Draft failed");
  } finally {
    setBusy(false);
  }
}

async function review(item:Advisory){if(!officer.trim()||!note.trim()){setErr("Enter officer name and review note.");return}if(decision==="edit"&&!edited.trim()){setErr("Enter the edited recommendation.");return}if(!window.confirm(`${decision.toUpperCase()} this draft? This records a review only; no SMS will be sent.`))return;setBusy(true);setErr("");try{await api(`/advisories/${item.id}/review`,{method:"POST",body:JSON.stringify({officer_name:officer.trim(),decision,review_note:note.trim(),...(decision==="edit"?{edited_advisory:edited.trim()}:{})})});setNote("");setEdited("");await refresh()}catch(x){setErr(x instanceof Error?x.message:"Review failed")}finally{setBusy(false)}}
const pending=a.filter(x=>x.status==="pending_review");
return <main className="ar-page"><header className="ar-header"><div><p className="ar-eyebrow">AGRIAGENT AFRICA · EXTENSION WORKFLOW</p><h1>Evidence &amp; Advisory Review</h1><p className="ar-muted">Review farm evidence, draft a sourced advisory, and record an officer decision.</p></div><button className="ar-btn ar-light" onClick={()=>void refresh()} disabled={loading||busy}><RefreshCw size={16}/>{loading?"Refreshing…":"Refresh"}</button></header>
<div className="ar-notice"><AlertTriangle size={19}/><div><b>Demo environment</b><p>Records and thresholds are synthetic. Satellite data is not connected. No SMS or external action is performed.</p></div></div>{err&&<div className="ar-error" role="alert">{err}</div>}
<section className="ar-section"><h2><FileSearch size={19}/> Household evidence</h2>{e?<><p className="ar-muted">{e.data_status}</p><div className="ar-grid"><article className="ar-card"><span>Field / crop</span><b>{e.field_name}</b><p>{e.crop} · {e.growth_stage}</p></article><article className="ar-card"><span>Rainfall (7 days)</span><b>{e.rainfall_7d_mm} mm</b><p>{e.rainfall_source} · {e.rainfall_date}</p></article><article className="ar-card"><span>Soil moisture</span><b>{e.soil_moisture_pct}%</b><p>{e.soil_moisture_source} · {e.soil_moisture_date}</p></article><article className="ar-card"><span>Market price</span><b>KSh {e.market_price_kes_per_kg}/kg</b><p>{e.market_source} · {e.market_date}</p></article></div><p className="ar-satellite"><b>Satellite: {e.satellite_status}</b> — {e.satellite_note}</p></>:<p className="ar-muted">Loading evidence…</p>}</section>
<section className="ar-section"><h2><ClipboardList size={19}/> Advisory queue</h2><div className="ar-actions"><span className="ar-muted">{pending.length} draft(s) awaiting review</span><button className="ar-btn ar-primary" onClick={()=>void create()} disabled={busy||loading}><FileSearch size={16}/>{busy?"Working…":"Generate advisory draft"}</button></div>
{!a.length?<p className="ar-empty">No drafts yet. Generate one to begin.</p>:a.map(x=><article className="ar-advisory" key={x.id}><div className="ar-advisory-head"><div><h3>{x.draft.title}</h3><p className="ar-muted">ID: {x.id}</p></div><span className={"ar-status "+(x.status==="pending_review"?"pending":"done")}>{x.status.replaceAll("_"," ")}</span></div><p className="ar-risk">Risk: <b>{x.draft.risk_level}</b> · Demo score {x.draft.risk_score}/2</p><p>{x.draft.recommendation}</p><p className="ar-muted">{x.draft.score_note}</p><h4>Supporting evidence</h4><ul>{x.draft.evidence.map((v,i)=><li key={i}>{v}</li>)}</ul><h4>Limitations</h4><ul>{x.draft.limitations.map((v,i)=><li key={i}>{v}</li>)}</ul>{x.status==="pending_review"?<div className="ar-form"><h4>Officer review</h4><label>Officer name<input value={officer} onChange={v=>setOfficer(v.target.value)} placeholder="Reviewing officer name"/></label><label>Decision<select value={decision} onChange={v=>setDecision(v.target.value as typeof decision)}><option value="approve">Approve draft</option><option value="edit">Edit recommendation</option><option value="reject">Reject draft</option></select></label>{decision==="edit"&&<label className="ar-wide">Edited recommendation<textarea rows={3} value={edited} onChange={v=>setEdited(v.target.value)}/></label>}<label className="ar-wide">Review note<textarea rows={2} value={note} onChange={v=>setNote(v.target.value)} placeholder="Reason for decision"/></label><button className="ar-btn ar-primary" disabled={busy} onClick={()=>void review(x)}>{decision==="approve"?<CheckCircle2 size={16}/>:decision==="reject"?<XCircle size={16}/>:<PencilLine size={16}/>} Record officer decision</button></div>:<p className="ar-review-note"><b>Reviewed by:</b> {x.officer_name||"Not recorded"} · {x.reviewed_at||""}<br/><b>Note:</b> {x.review_note||"—"}</p>}</article>)}</section>
<section className="ar-section"><h2><ClipboardList size={19}/> Audit trail</h2>{!l.length?<p className="ar-muted">No logged actions yet.</p>:<div className="ar-table-wrap"><table><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Outcome</th></tr></thead><tbody>{l.map(x=><tr key={x.id}><td>{new Date(x.timestamp).toLocaleString()}</td><td>{x.actor}</td><td>{x.action}</td><td>{x.outcome}</td></tr>)}</tbody></table></div>}</section><footer className="ar-muted">Officer name is audit attribution, not authentication. No messages or orders are sent by this screen.</footer></main>}
