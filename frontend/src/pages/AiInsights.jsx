import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getRestockSuggestions, getSlowMoving } from "../services/api";
import { AlertTriangle, TrendingDown, RefreshCw } from "lucide-react";

const urgencyColor = {
  critical: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
  soon: { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" }
};

const AiInsights = () => {
  const [restock, setRestock] = useState([]);
  const [slow, setSlow] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([getRestockSuggestions(), getSlowMoving()]);
      setRestock(r.data);
      setSlow(s.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <Sidebar />

      <main style={{ marginLeft: "240px", flex: 1, padding: "36px 40px", maxWidth: "calc(100% - 240px)" }}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: "32px"
        }}>
          <div>
            <p style={{
              margin: "0 0 2px", fontSize: "12px", fontWeight: 600,
              letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase"
            }}>
              Smart Suggestions
            </p>
            <h2 style={{
              margin: 0, fontSize: "24px", fontWeight: 700,
              color: "#0f172a", letterSpacing: "-0.3px"
            }}>
              AI Insights
            </h2>
            <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: "13.5px" }}>
              Powered by your sales data
            </p>
          </div>

          <button
            onClick={load}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "10px 16px", background: "#fff",
              border: "1.5px solid #e2e8f0", borderRadius: "10px",
              cursor: "pointer", fontSize: "13.5px", fontWeight: 600,
              color: "#374151", transition: "background 0.15s, border-color 0.15s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "32px 24px", background: "#fff", borderRadius: "16px",
            border: "1px solid #e8edf2", boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            <div style={{
              width: "18px", height: "18px", borderRadius: "50%",
              border: "2.5px solid #e2e8f0", borderTopColor: "#3b82f6",
              animation: "spin 0.7s linear infinite"
            }} />
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
              Analyzing your data...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* ── Restock Suggestions ── */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px"
              }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "10px",
                  background: "#fff7ed", display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}>
                  <AlertTriangle size={16} color="#f97316" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                    Restock Suggestions
                  </h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                    {restock.length} product{restock.length !== 1 ? "s" : ""} need attention
                  </p>
                </div>
              </div>

              {restock.length === 0 ? (
                <div style={{
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  borderRadius: "14px", padding: "22px 24px",
                  display: "flex", alignItems: "center", gap: "10px"
                }}>
                  <span style={{ fontSize: "18px" }}>✅</span>
                  <p style={{ margin: 0, color: "#16a34a", fontSize: "13.5px", fontWeight: 500 }}>
                    All products have healthy stock levels.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px"
                }}>
                  {restock.map(item => {
                    const c = urgencyColor[item.urgency] || urgencyColor.soon;
                    return (
                      <div
                        key={item.productId}
                        style={{
                          background: c.bg, border: `1.5px solid ${c.border}`,
                          borderRadius: "14px", padding: "20px",
                          boxShadow: "0 1px 3px rgba(15,23,42,0.04)"
                        }}
                      >
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "flex-start", marginBottom: "16px"
                        }}>
                          <p style={{
                            margin: 0, fontWeight: 700, fontSize: "14.5px",
                            color: "#0f172a", maxWidth: "160px",
                            lineHeight: "1.4"
                          }}>
                            {item.productName}
                          </p>
                          <span style={{
                            padding: "3px 10px", borderRadius: "20px",
                            fontSize: "10.5px", fontWeight: 700,
                            background: c.text, color: "#fff",
                            letterSpacing: "0.06em", whiteSpace: "nowrap"
                          }}>
                            {item.urgency.toUpperCase()}
                          </span>
                        </div>

                        <div style={{
                          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"
                        }}>
                          {[
                            ["Current Stock", item.currentStock],
                            ["Daily Avg Sales", item.dailyAvgSales],
                            ["Days Left", item.daysOfStockLeft],
                            ["Suggest Restock", item.suggestedRestockQty + " units"]
                          ].map(([label, val]) => (
                            <div
                              key={label}
                              style={{
                                background: "rgba(255,255,255,0.6)",
                                borderRadius: "8px", padding: "10px 12px"
                              }}
                            >
                              <p style={{
                                margin: 0, fontSize: "11px", color: "#64748b",
                                fontWeight: 600, letterSpacing: "0.04em",
                                textTransform: "uppercase"
                              }}>
                                {label}
                              </p>
                              <p style={{
                                margin: "4px 0 0", fontSize: "16px",
                                fontWeight: 700, color: c.text
                              }}>
                                {val}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Slow-Moving Products ── */}
            <div>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px"
              }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "10px",
                  background: "#f5f3ff", display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}>
                  <TrendingDown size={16} color="#8b5cf6" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                    Slow-Moving Products
                  </h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                    {slow.length} product{slow.length !== 1 ? "s" : ""} with low velocity
                  </p>
                </div>
              </div>

              {slow.length === 0 ? (
                <div style={{
                  background: "#f5f3ff", border: "1px solid #ddd6fe",
                  borderRadius: "14px", padding: "22px 24px",
                  display: "flex", alignItems: "center", gap: "10px"
                }}>
                  <span style={{ fontSize: "18px" }}>🚀</span>
                  <p style={{ margin: 0, color: "#7c3aed", fontSize: "13.5px", fontWeight: 500 }}>
                    All products are selling well.
                  </p>
                </div>
              ) : (
                <div style={{
                  background: "#fff", borderRadius: "16px",
                  border: "1px solid #e8edf2",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.05)", overflow: "hidden"
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f8fafc" }}>
                      <tr>
                        {["Product", "Total Sold", "Current Stock", "Recommendation"].map(h => (
                          <th key={h} style={{
                            textAlign: "left", padding: "11px 16px",
                            fontSize: "11.5px", color: "#94a3b8",
                            fontWeight: 700, letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            borderBottom: "1px solid #e9edf2"
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {slow.map((item, idx) => (
                        <tr
                          key={item.productId}
                          style={{
                            borderTop: "1px solid #f8fafc",
                            background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                            transition: "background 0.12s"
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#faf5ff")}
                          onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbfc")}
                        >
                          <td style={{
                            padding: "13px 16px", fontSize: "13.5px",
                            fontWeight: 600, color: "#0f172a"
                          }}>
                            {item.productName}
                          </td>

                          <td style={{ padding: "13px 16px", fontSize: "13.5px", color: "#64748b" }}>
                            {item.totalSold}{" "}
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>units</span>
                          </td>

                          <td style={{ padding: "13px 16px", fontSize: "13.5px", color: "#64748b" }}>
                            {item.currentStock}
                          </td>

                          <td style={{ padding: "13px 16px" }}>
                            <span style={{
                              padding: "4px 12px", background: "#f5f3ff",
                              color: "#7c3aed", borderRadius: "20px",
                              fontSize: "12px", fontWeight: 600,
                              border: "1px solid #ddd6fe", whiteSpace: "nowrap"
                            }}>
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