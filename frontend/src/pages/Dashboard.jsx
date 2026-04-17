import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import LowStockAlert from "../components/LowStockAlert";
import {
  getSummary,
  getLowStockProducts,
  getTransactions,
  createCashier
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, Package, TrendingUp, DollarSign, X, User, Mail, Lock, UserPlus } from "lucide-react";

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [lowStock, setLowStock] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [period, setPeriod] = useState("today");

  const { userInfo } = useAuth();

  const [showCashierModal, setShowCashierModal] = useState(false);
  const [cashierForm, setCashierForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    getSummary(period).then(r => setSummary(r.data)).catch(() => { });
    getLowStockProducts().then(r => setLowStock(r.data)).catch(() => { });
    getTransactions().then(r => setRecentTx(r.data.slice(0, 5))).catch(() => { });
  }, [period]);

  const handleCreateCashier = async () => {
    try {
      await createCashier(cashierForm);
      alert("Cashier created successfully");
      setShowCashierModal(false);
      setCashierForm({ name: "", email: "", password: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Error creating cashier");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ marginLeft: "240px", flex: 1, padding: "32px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>
              Dashboard
            </h2>

            {/* ✅ Shop Name Display */}
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
              Managing: <strong>{userInfo?.shopName || "Your Store"}</strong>
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            {userInfo?.role === "admin" && (
              <button
                onClick={() => setShowCashierModal(true)}
                style={{
                  padding: "10px 18px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.3)";
                }}
              >
                <UserPlus size={16} />
                Create Cashier
              </button>
            )}

            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                background: "#fff",
                cursor: "pointer"
              }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
          <StatCard title="Total Sales" value={`₹${summary.totalSales || 0}`} subtitle={period} icon={DollarSign} color="#3b82f6" />
          <StatCard title="Total Orders" value={summary.totalOrders || 0} subtitle={period} icon={ShoppingCart} color="#8b5cf6" />
          <StatCard title="Avg Order Value" value={`₹${summary.averageOrderValue || 0}`} subtitle={period} icon={TrendingUp} color="#10b981" />
          <StatCard title="Low Stock Items" value={lowStock.length} subtitle="needs attention" icon={Package} color="#f97316" />
        </div>

        <LowStockAlert products={lowStock} />

        {/* Recent Transactions */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginTop: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>
            Recent Transactions
          </h3>

          {recentTx.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>
              No transactions yet
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {["Transaction ID", "Items", "Total", "Payment", "Time"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {recentTx.map(tx => (
                  <tr key={tx._id} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#374151" }}>
                      #{tx._id.slice(-6)}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#374151" }}>
                      {tx.items.length} items
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                      ₹{tx.totalAmount}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: tx.paymentMethod === "cash" ? "#dcfce7" : "#dbeafe",
                        color: tx.paymentMethod === "cash" ? "#166534" : "#1d4ed8"
                      }}>
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "#94a3b8" }}>
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          )}
        </div>

        {/* Enhanced Create Cashier Modal */}
        {showCashierModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              animation: "fadeIn 0.2s ease"
            }}
            onClick={() => setShowCashierModal(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                width: "420px",
                maxWidth: "90%",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                animation: "slideUp 0.3s ease"
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: "24px 24px 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <UserPlus size={20} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                      Create New Cashier
                    </h3>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                      Add a new team member
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCashierModal(false)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#f8fafc",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = "#f1f5f9";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = "#f8fafc";
                  }}
                >
                  <X size={18} color="#64748b" />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "24px" }}>
                {/* Name Input */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155"
                  }}>
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <User
                      size={18}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8"
                      }}
                    />
                    <input
                      placeholder="John Doe"
                      value={cashierForm.name}
                      onChange={e => setCashierForm({ ...cashierForm, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 12px 12px 42px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                        transition: "all 0.2s ease",
                        outline: "none"
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155"
                  }}>
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail
                      size={18}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8"
                      }}
                    />
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={cashierForm.email}
                      onChange={e => setCashierForm({ ...cashierForm, email: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 12px 12px 42px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                        transition: "all 0.2s ease",
                        outline: "none"
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155"
                  }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock
                      size={18}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8"
                      }}
                    />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={cashierForm.password}
                      onChange={e => setCashierForm({ ...cashierForm, password: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 12px 12px 42px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#0f172a",
                        boxSizing: "border-box",
                        transition: "all 0.2s ease",
                        outline: "none"
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <p style={{
                    margin: "6px 0 0",
                    fontSize: "12px",
                    color: "#64748b"
                  }}>
                    Minimum 6 characters recommended
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleCreateCashier}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.3)";
                    }}
                  >
                    <UserPlus size={16} />
                    Create Cashier
                  </button>
                  <button
                    onClick={() => setShowCashierModal(false)}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      background: "#fff",
                      color: "#64748b",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;