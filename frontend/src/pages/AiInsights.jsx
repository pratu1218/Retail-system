import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getRestockSuggestions, getSlowMoving } from "../services/api";
import { AlertTriangle, TrendingDown, RefreshCw } from "lucide-react";

const urgencyColor = { critical: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" }, soon: { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" } };

const AiInsights = () => {
  const [restock, setRestock] = useState([]);
  const [slow, setSlow] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([getRestockSuggestions(), getSlowMoving()]);
      setRestock(r.data); setSlow(s.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ marginLeft: "240px", flex: 1, padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>AI Insights</h2>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>Smart suggestions powered by your sales data</p>
          </div>
          <button onClick={load} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? <p style={{ color: "#94a3b8" }}>Analyzing your data...</p> : (
          <>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <AlertTriangle size={18} color="#f97316" />
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Restock Suggestions ({restock.length})</h3>
              </div>
              {restock.length === 0 ? (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "20px", color: "#16a34a", fontSize: "14px" }}>
                  All products have healthy stock levels.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {restock.map(item => {
                    const c = urgencyColor[item.urgency] || urgencyColor.soon;
                    return (
                      <div key={item.productId} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: "10px", padding: "18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: "15px", color: "#0f172a" }}>{item.productName}</p>
                          <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: c.text, color: "#fff" }}>
                            {item.urgency.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          {[["Current Stock", item.currentStock], ["Daily Avg Sales", item.dailyAvgSales], ["Days Left", item.daysOfStockLeft], ["Suggest Restock", item.suggestedRestockQty + " units"]].map(([label, val]) => (
                            <div key={label}>
                              <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{label}</p>
                              <p style={{ margin: "2px 0 0", fontSize: "15px", fontWeight: 700, color: c.text }}>{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <TrendingDown size={18} color="#8b5cf6" />
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Slow-Moving Products ({slow.length})</h3>
              </div>
              {slow.length === 0 ? (
                <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "10px", padding: "20px", color: "#7c3aed", fontSize: "14px" }}>
                  All products are selling well.
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f8fafc" }}>
                      <tr>
                        {["Product", "Total Sold", "Current Stock", "Recommendation"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {slow.map(item => (
                        <tr key={item.productId} style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 500 }}>{item.productName}</td>
                          <td style={{ padding: "12px 16px", fontSize: "14px" }}>{item.totalSold} units</td>
                          <td style={{ padding: "12px 16px", fontSize: "14px" }}>{item.currentStock}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "4px 10px", background: "#f5f3ff", color: "#7c3aed", borderRadius: "6px", fontSize: "12px", fontWeight: 500 }}>
                              {item.recommendation}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AiInsights;