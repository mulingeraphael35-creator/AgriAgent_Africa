import { useMemo, useState } from "react";
import { UserPlus, ClipboardList, CheckCircle2, Clock3, Send } from "lucide-react";

type TaskStatus = "Assigned" | "In progress" | "Completed";
type FieldTask = { id: number; field: string; issue: string; assignee: string; priority: "High" | "Medium" | "Low"; status: TaskStatus };
const panel: React.CSSProperties = { background: "var(--card, #fff)", border: "1px solid var(--border, #e5e7eb)", borderRadius: 16, padding: 20 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 9, background: "white", color: "#1f2937", boxSizing: "border-box" };

export default function FarmTeam() {
  const [agents, setAgents] = useState(["Extension Agent 1", "Extension Agent 2"]);
  const [tasks, setTasks] = useState<FieldTask[]>([
    { id: 1, field: "North Plot", issue: "Check soil moisture and confirm irrigation need", assignee: "Extension Agent 1", priority: "High", status: "Assigned" },
    { id: 2, field: "East Plot", issue: "Inspect crop growth and possible nutrient stress", assignee: "Extension Agent 2", priority: "Medium", status: "In progress" },
  ]);
  const [field, setField] = useState("North Plot");
  const [issue, setIssue] = useState("Check soil moisture and irrigation need");
  const [assignee, setAssignee] = useState("Extension Agent 1");
  const [priority, setPriority] = useState<FieldTask["priority"]>("High");
  const [newAgent, setNewAgent] = useState("");
  const [notice, setNotice] = useState("");
  const completed = useMemo(() => tasks.filter((t) => t.status === "Completed").length, [tasks]);

  function assignTask() {
    if (!issue.trim() || !assignee) { setNotice("Enter an issue and choose an extension agent."); return; }
    setTasks((current) => [{ id: Date.now(), field, issue: issue.trim(), assignee, priority, status: "Assigned" }, ...current]);
    setNotice(`Field response assigned to ${assignee}. This is recorded in this prototype only; no external message was sent.`);
    setIssue("");
  }
  function addAgent() {
    const name = newAgent.trim();
    if (!name) return;
    if (agents.some((a) => a.toLowerCase() === name.toLowerCase())) { setNotice("That team member already exists."); return; }
    setAgents((current) => [...current, name]);
    setAssignee(name);
    setNewAgent("");
    setNotice(`${name} added to the local prototype team.`);
  }
  function cycleStatus(id: number) {
    setTasks((current) => current.map((t) => t.id !== id ? t : { ...t, status: t.status === "Assigned" ? "In progress" : t.status === "In progress" ? "Completed" : "Assigned" }));
  }

  return <section style={{ display: "grid", gap: 20, color: "var(--text, #1f2937)" }}>
    <header className="page-header"><div><p className="section-label">FARM TEAM</p><h2>People & field response</h2><p>Assign farm issues to an extension agent and track follow-up.</p></div></header>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
      <div style={panel}><UserPlus size={22} color="#25834a" /><p style={{ color: "#6b7280", marginBottom: 4 }}>Team members</p><h2 style={{ margin: 0 }}>{agents.length}</h2></div>
      <div style={panel}><ClipboardList size={22} color="#2563eb" /><p style={{ color: "#6b7280", marginBottom: 4 }}>Open field responses</p><h2 style={{ margin: 0 }}>{tasks.length - completed}</h2></div>
      <div style={panel}><CheckCircle2 size={22} color="#16803d" /><p style={{ color: "#6b7280", marginBottom: 4 }}>Completed</p><h2 style={{ margin: 0 }}>{completed}</h2></div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "start" }}>
      <div style={panel}><h3 style={{ marginTop: 0 }}>Assign a field response</h3><p style={{ color: "#6b7280", marginTop: -4 }}>Create a follow-up task for an extension agent.</p>
        <label style={{ display: "block", marginBottom: 6 }}>Field</label><select style={{ ...inputStyle, marginBottom: 12 }} value={field} onChange={(e) => setField(e.target.value)}><option>North Plot</option><option>East Plot</option><option>South Field</option><option>West Field</option></select>
        <label style={{ display: "block", marginBottom: 6 }}>Issue / action required</label><textarea style={{ ...inputStyle, minHeight: 88, resize: "vertical", marginBottom: 12 }} value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Describe what the agent should check" />
        <label style={{ display: "block", marginBottom: 6 }}>Assign to</label><select style={{ ...inputStyle, marginBottom: 12 }} value={assignee} onChange={(e) => setAssignee(e.target.value)}>{agents.map((a) => <option key={a}>{a}</option>)}</select>
        <label style={{ display: "block", marginBottom: 6 }}>Priority</label><select style={{ ...inputStyle, marginBottom: 14 }} value={priority} onChange={(e) => setPriority(e.target.value as FieldTask["priority"])}><option>High</option><option>Medium</option><option>Low</option></select>
        <button type="button" className="primary-button" onClick={assignTask} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>Assign response <Send size={16} /></button>
        {notice && <p role="status" style={{ marginBottom: 0, color: "#256b3b", fontSize: 13 }}>{notice}</p>}
      </div>
      <div style={panel}><h3 style={{ marginTop: 0 }}>Team members</h3><div style={{ display: "grid", gap: 10, marginBottom: 18 }}>{agents.map((a, i) => <div key={a} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#f8fafc", borderRadius: 10 }}><div style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: "50%", background: "#e2f3e8", color: "#17663a", fontWeight: 700 }}>{a.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</div><div><strong>{a}</strong><div style={{ fontSize: 13, color: "#6b7280" }}>Extension support · {i === 0 ? "Field monitoring" : "Crop follow-up"}</div></div></div>)}</div>
        <form onSubmit={(e) => { e.preventDefault(); addAgent(); }} style={{ display: "flex", gap: 8 }}><input style={inputStyle} value={newAgent} onChange={(e) => setNewAgent(e.target.value)} placeholder="Add team member name" aria-label="New team member name" /><button className="secondary-button" type="submit" aria-label="Add team member"><UserPlus size={17} /></button></form>
      </div>
    </div>
    <div style={panel}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}><h3 style={{ margin: 0 }}>Field response tracker</h3><span style={{ color: "#6b7280", fontSize: 13 }}>Select a status to advance the workflow</span></div>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>{tasks.map((t) => <article key={t.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "center" }}><div><div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}><strong>{t.field}</strong><span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 20, background: t.priority === "High" ? "#fee2e2" : t.priority === "Medium" ? "#fef3c7" : "#e5e7eb", color: t.priority === "High" ? "#991b1b" : "#854d0e" }}>{t.priority} priority</span></div><p style={{ margin: "0 0 6px" }}>{t.issue}</p><span style={{ color: "#6b7280", fontSize: 13 }}>Assigned to {t.assignee}</span></div><button type="button" className="secondary-button" onClick={() => cycleStatus(t.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>{t.status === "Completed" ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}{t.status}</button></article>)}</div>
    </div>
    <div style={{ ...panel, background: "#f0fdf4", borderColor: "#bbf7d0" }}><strong style={{ color: "#166534" }}>Prototype limitation</strong><p style={{ marginBottom: 0, color: "#166534" }}>Assignments and statuses currently live only in this browser session. The backend will persist them and enable real delivery through SMS, email, WhatsApp, or an agent dashboard after credentials and recipient contacts are configured.</p></div>
  </section>;
}
