import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getTopProducts, getDailySales } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const Analytics = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);

  useEffect(() => {
    getTopProducts().then(r => setTopProducts(r.data)).catch(() => { });
    getDailySales().then(r => setDailySales(r.data.reverse())).catch(() => { });
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ marginLeft: "240px", flex: 1, padding: "32px" }}>
        <h2 style={{ margin: "0 0 28px", fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>Analytics</h2>

        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600 }}>Daily Sales (Last 30 Days)</h3>
          {dailySales.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>No sales data yet. Complete some transactions first.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${v}`, "Sales"]} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600 }}>Top 10 Products by Units Sold</h3>
          {topProducts.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>No sales data yet. Complete some transactions first.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="_id" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalSold" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;