import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getTopProducts, getDailySales } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";

const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0f172a",
          border: "none",
          borderRadius: "10px",
          padding: "10px 14px",
          boxShadow: "0 8px 24px rgba(15,23,42,0.18)"
        }}
      >
        <p style={{ margin: "0 0 3px", fontSize: "11px", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.04em" }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>
          ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0f172a",
          border: "none",
          borderRadius: "10px",
          padding: "10px 14px",
          boxShadow: "0 8px 24px rgba(15,23,42,0.18)"
        }}
      >
        <p style={{ margin: "0 0 3px", fontSize: "11px", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.04em" }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>
          {payload[0].value} units
        </p>
      </div>
    );
  }
  return null;
};

const EmptyState = ({ message }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "52px 20px",
      gap: "12px"
    }}
  >
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    </div>
    <p style={{ margin: 0, color: "#94a3b8", fontSize: "13.5px", textAlign: "center", maxWidth: "240px", lineHeight: "1.6" }}>
      {message}
    </p>
  </div>
);

const Analytics = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);

  useEffect(() => {
    getTopProducts()
      .then((r) => setTopProducts(r.data))
      .catch(() => { });
    getDailySales()
      .then((r) => setDailySales(r.data.reverse()))
      .catch(() => { });
  }, []);

  const totalSales = dailySales.reduce((sum, d) => sum + (d.total || 0), 0);
  const peakDay = dailySales.reduce((max, d) => (d.total > (max?.total || 0) ? d : max), null);
  const totalUnits = topProducts.reduce((sum, p) => sum + (p.totalSold || 0), 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <Sidebar />

      <main style={{ marginLeft: "240px", flex: 1, padding: "36px 40px", maxWidth: "calc(100% - 240px)" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <p
            style={{
              margin: "0 0 2px",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#94a3b8",
              textTransform: "uppercase"
            }}
          >
            Insights
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.3px"
            }}
          >
            Analytics
          </h2>
        </div>

        {/* Summary Pills */}
        {dailySales.length > 0 && (
          <div style={{ display: "flex", gap: "14px", marginBottom: "28px", flexWrap: "wrap" }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8edf2",
                borderRadius: "12px",
                padding: "14px 20px",
                minWidth: "160px",
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)"
              }}
            >
              <p style={{ margin: "0 0 4px", fontSize: "11.5px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                30-Day Revenue
              </p>
              <p style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
                ₹{totalSales.toLocaleString("en-IN")}
              </p>
            </div>

            {peakDay && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e8edf2",
                  borderRadius: "12px",
                  padding: "14px 20px",
                  minWidth: "160px",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.04)"
                }}
              >
                <p style={{ margin: "0 0 4px", fontSize: "11.5px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Peak Day
                </p>
                <p style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
                  {peakDay._id}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  ₹{peakDay.total.toLocaleString("en-IN")}
                </p>
              </div>
            )}

            {topProducts.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e8edf2",
                  borderRadius: "12px",
                  padding: "14px 20px",
                  minWidth: "160px",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.04)"
                }}
              >
                <p style={{ margin: "0 0 4px", fontSize: "11.5px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Units Sold
                </p>
                <p style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
                  {totalUnits.toLocaleString("en-IN")}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  across top {topProducts.length} products
                </p>
              </div>
            )}
          </div>
        )}

        {/* Daily Sales Chart */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "26px 28px",
            marginBottom: "22px",
            border: "1px solid #e8edf2",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}
        >
          <div style={{ marginBottom: "22px" }}>
            <h3
              style={{
                margin: "0 0 3px",
                fontSize: "15px",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.1px"
              }}
            >
              Daily Sales
            </h3>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#94a3b8" }}>
              Revenue trend over the last 30 days
            </p>
          </div>

          {dailySales.length === 0 ? (
            <EmptyState message="No sales data yet. Complete some transactions first." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailySales} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                  width={58}
                />
                <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products Chart */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "26px 28px",
            border: "1px solid #e8edf2",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}
        >
          <div style={{ marginBottom: "22px" }}>
            <h3
              style={{
                margin: "0 0 3px",
                fontSize: "15px",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.1px"
              }}
            >
              Top 10 Products
            </h3>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#94a3b8" }}>
              Ranked by units sold
            </p>
          </div>

          {topProducts.length === 0 ? (
            <EmptyState message="No sales data yet. Complete some transactions first." />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="_id"
                  type="category"
                  width={148}
                  tick={{ fontSize: 11.5, fill: "#374151", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#f1f5f9" }} />
                <Bar
                  dataKey="totalSold"
                  fill="#3b82f6"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;