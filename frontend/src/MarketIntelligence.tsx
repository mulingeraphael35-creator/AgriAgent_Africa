import { useMemo, useState } from "react";
import { Search, TrendingUp, MapPin, Info } from "lucide-react";

type MarketRow = { crop: string; market: string; price: number; unit: string; trend: "Up" | "Stable" | "Down" };

// Clearly labelled illustrative data. Replace with verified market feeds in the backend.
const demoRows: MarketRow[] = [
  { crop: "Maize", market: "Nairobi", price: 62, unit: "KES/kg", trend: "Up" },
  { crop: "Maize", market: "Kitui", price: 56, unit: "KES/kg", trend: "Stable" },
  { crop: "Beans", market: "Nairobi", price: 148, unit: "KES/kg", trend: "Up" },
  { crop: "Beans", market: "Kitui", price: 137, unit: "KES/kg", trend: "Down" },
  { crop: "Tomatoes", market: "Nairobi", price: 78, unit: "KES/kg", trend: "Down" },
  { crop: "Tomatoes", market: "Kitui", price: 70, unit: "KES/kg", trend: "Stable" },
];

const panel: React.CSSProperties = { background: "var(--card, #fff)", border: "1px solid var(--border, #e5e7eb)", borderRadius: 16, padding: 20 };
const fieldStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 9, background: "white", color: "#1f2937" };

export default function MarketIntelligence() {
  const [crop, setCrop] = useState("All crops");
  const [market, setMarket] = useState("All markets");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => demoRows.filter((r) =>
    (crop === "All crops" || r.crop === crop) &&
    (market === "All markets" || r.market === market) &&
    `${r.crop} ${r.market}`.toLowerCase().includes(query.toLowerCase())
  ), [crop, market, query]);

  return <section style={{ display: "grid", gap: 20, color: "var(--text, #1f2937)" }}>
    <header className="page-header"><div><p className="section-label">MARKET INTELLIGENCE</p><h2>Crop prices & selling outlook</h2><p>Compare indicative prices and prepare a better-informed selling decision.</p></div></header>
    <div style={{ ...panel, background: "#fff8e8", borderColor: "#f3d38a", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <Info size={20} color="#9a6700" style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ margin: 0, color: "#754c00" }}><strong>Prototype data:</strong> These prices are illustrative demo values, not verified live market quotes. Confirm prices, units, quality grades, and transport costs with buyers before selling.</p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
      <div style={panel}><span style={{ color: "#6b7280", fontSize: 13 }}>Crops tracked</span><h2 style={{ margin: "8px 0" }}>3</h2><span>Maize, beans, tomatoes</span></div>
      <div style={panel}><span style={{ color: "#6b7280", fontSize: 13 }}>Markets compared</span><h2 style={{ margin: "8px 0" }}>2</h2><span>Nairobi and Kitui (demo)</span></div>
      <div style={panel}><span style={{ color: "#6b7280", fontSize: 13 }}>Decision reminder</span><h2 style={{ margin: "8px 0", fontSize: 20 }}>Compare net return</h2><span>Price minus transport and handling</span></div>
    </div>
    <div style={panel}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}><div><h3 style={{ margin: 0 }}>Indicative price comparison</h3><p style={{ margin: "6px 0 0", color: "#6b7280" }}>Filter the sample data below.</p></div><TrendingUp size={24} color="#25834a" /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
        <select aria-label="Filter crop" style={fieldStyle} value={crop} onChange={(e) => setCrop(e.target.value)}><option>All crops</option><option>Maize</option><option>Beans</option><option>Tomatoes</option></select>
        <select aria-label="Filter market" style={fieldStyle} value={market} onChange={(e) => setMarket(e.target.value)}><option>All markets</option><option>Nairobi</option><option>Kitui</option></select>
        <div style={{ position: "relative" }}><Search size={17} style={{ position: "absolute", left: 10, top: 12, color: "#6b7280" }} /><input aria-label="Search crop or market" placeholder="Search crop or market" value={query} onChange={(e) => setQuery(e.target.value)} style={{ ...fieldStyle, paddingLeft: 34, boxSizing: "border-box" }} /></div>
      </div>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}><thead><tr>{["Crop", "Market", "Indicative price", "Trend"].map((h) => <th key={h} style={{ textAlign: "left", padding: "12px 10px", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: 12 }}>{h}</th>)}</tr></thead><tbody>{rows.map((r) => <tr key={`${r.crop}-${r.market}`}>{<><td style={{ padding: 12, borderBottom: "1px solid #f0f1f2", fontWeight: 600 }}>{r.crop}</td><td style={{ padding: 12, borderBottom: "1px solid #f0f1f2" }}><MapPin size={13} style={{ display: "inline", marginRight: 4 }} />{r.market}</td><td style={{ padding: 12, borderBottom: "1px solid #f0f1f2" }}>KES {r.price}/{r.unit.split("/")[1]}</td><td style={{ padding: 12, borderBottom: "1px solid #f0f1f2", color: r.trend === "Up" ? "#16803d" : r.trend === "Down" ? "#b45309" : "#6b7280" }}>{r.trend}</td></>}</tr>)}{rows.length === 0 && <tr><td colSpan={4} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>No matching records.</td></tr>}</tbody></table></div>
    </div>
    <div style={panel}><h3 style={{ marginTop: 0 }}>Before you sell</h3><ul style={{ marginBottom: 0, paddingLeft: 22, lineHeight: 1.8 }}><li>Confirm today's price with at least two local buyers or market sources.</li><li>Compare the net amount after transport, storage, fees, and grading.</li><li>Check crop quality, moisture, expected harvest volume, and whether you need cash immediately.</li><li>Record the confirmed offer and date so your team can compare it later.</li></ul></div>
  </section>;
}
