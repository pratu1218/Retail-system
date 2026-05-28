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
import {
  ShoppingCart,
  Package,
  TrendingUp,
  DollarSign,
  X,
  User,
  Mail,
  Lock,
  UserPlus
} from "lucide-react";

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  marginBottom: "14px",
  border: "1.5px solid #e2e8f0",
  borderRadius: "10px",
  fontSize: "14px",
  color: "#0f172a",
  background: "#f8fafc",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.18s, background 0.18s"
};

const selectStyle = {
  padding: "9px 14px",
  border: "1.5px solid #e2e8f0",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: 500,
  background: "#fff",
  color: "#374151",
  cursor: "pointer",
  outline: "none",
  transition: "border-color 0.18s"
};

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [lowStock, setLowStock] = useState([]);
  const [recentTx, setRecentTx] = useState([]);

  const [summaryPeriod, setSummaryPeriod] = useState("today");
  const [transactionPeriod, setTransactionPeriod] = useState("today");

  const { userInfo } = useAuth();

  const [showCashierModal, setShowCashierModal] = useState(false);
  const [cashierForm, setCashierForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    getSummary(summaryPeriod)
      .then((r) => setSummary(r.data))
      .catch(() => { });
    getLowStockProducts()
      .then((r) => setLowStock(r.data))
      .catch(() => { });
  }, [summaryPeriod]);

  useEffect(() => {
    getTransactions(transactionPeriod)
      .then((r) => setRecentTx(r.data))
      .catch(() => { });
  }, [transactionPeriod]);

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

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }) +
      " · " +
      d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  };

  const getItemNames = (items) => {
    if (!items || items.length === 0) return "—";
    return items.map((i) => i.productName || "Unknown").join(", ");
  };

  const periodLabel = {
    today: "Today",
    week: "This Week",
    month: "This Month"
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <Sidebar />

      <main
        style={{
          marginLeft: "240px",
          flex: 1,
          padding: "36px 40px",
          maxWidth: "calc(100% - 240px)"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px"
          }}
        >
          <div>
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
              Overview
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
              Dashboard
            </h2>
            <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: "13.5px" }}>
              Managing:{" "}
              <span
                style={{
                  fontWeight: 600,
                  color: "#334155",
                  background: "#e2e8f0",
                  padding: "1px 8px",
                  borderRadius: "6px",
                  fontSize: "13px"
                }}
              >
                {userInfo?.shopName || "Your Store"}
              </span>
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {userInfo?.role === "admin" && (
              <button
                onClick={() => setShowCashierModal(true)}
                style={{
                  padding: "10px 18px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  boxShadow: "0 2px 10px rgba(59,130,246,0.32)",
                  letterSpacing: "0.01em",
                  transition: "opacity 0.15s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <UserPlus size={15} />
                Create Cashier
              </button>
            )}

            <select
              value={summaryPeriod}
              onChange={(e) => setSummaryPeriod(e.target.value)}
              style={selectStyle}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "18px",
            marginBottom: "28px"
          }}
        >
          <StatCard
            title="Total Sales"
            value={`₹${summary.totalSales || 0}`}
            subtitle={periodLabel[summaryPeriod]}
            icon={DollarSign}
            color="#3b82f6"
          />
          <StatCard
            title="Total Orders"
            value={summary.totalOrders || 0}
            subtitle={periodLabel[summaryPeriod]}
            icon={ShoppingCart}
            color="#8b5cf6"
          />
          <StatCard
            title="Avg Order Value"
            value={`₹${summary.averageOrderValue || 0}`}
            subtitle={periodLabel[summaryPeriod]}
            icon={TrendingUp}
            color="#10b981"
          />
          <StatCard
            title="Low Stock Items"
            value={lowStock.length}
            subtitle="needs attention"
            icon={Package}
            color="#f97316"
          />
        </div>

        <LowStockAlert products={lowStock} />

        {/* Transaction History */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px 28px",
            marginTop: "24px",
            border: "1px solid #e8edf2",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.1px"
                }}
              >
                Transaction History
              </h3>
              <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#94a3b8" }}>
                {recentTx.length} record{recentTx.length !== 1 ? "s" : ""} for{" "}
                {periodLabel[transactionPeriod].toLowerCase()}
              </p>
            </div>

            <select
              value={transactionPeriod}
              onChange={(e) => setTransactionPeriod(e.target.value)}
              style={selectStyle}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {recentTx.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#94a3b8",
                fontSize: "14px"
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px"
                }}
              >
                <ShoppingCart size={20} color="#cbd5e1" />
              </div>
              No transactions yet
            </div>
          ) : (
            <div
              style={{
                overflowY: "auto",
                maxHeight: "380px",
                borderRadius: "10px",
                border: "1px solid #f1f5f9"
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13.5px"
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      position: "sticky",
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    {["Transaction ID", "Items", "Total", "Payment", "Date & Time"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "11px 16px",
                            fontSize: "11.5px",
                            color: "#94a3b8",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            borderBottom: "1px solid #e9edf2"
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {recentTx.map((tx, idx) => (
                    <tr
                      key={tx._id}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                        transition: "background 0.12s"
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f0f7ff")
                      }
                      onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        idx % 2 === 0 ? "#fff" : "#fafbfc")
                      }
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: "#f1f5f9",
                            color: "#334155",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            letterSpacing: "0.04em"
                          }}
                        >
                          #{tx._id.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#374151",
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {getItemNames(tx.items)}
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: "13.5px"
                          }}
                        >
                          ₹{tx.totalAmount}
                        </span>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background:
                              tx.paymentMethod?.toLowerCase() === "cash"
                                ? "#ecfdf5"
                                : "#eff6ff",
                            color:
                              tx.paymentMethod?.toLowerCase() === "cash"
                                ? "#059669"
                                : "#2563eb"
                          }}
                        >
                          {tx.paymentMethod}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#64748b",
                          fontSize: "12.5px"
                        }}
                      >
                        {formatDateTime(tx.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Cashier Modal */}
        {showCashierModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(5px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000
            }}
            onClick={() => setShowCashierModal(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "18px",
                width: "420px",
                maxWidth: "92%",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 24px 48px -8px rgba(15,23,42,0.18), 0 8px 16px -4px rgba(15,23,42,0.08)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "22px 24px 18px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <UserPlus size={16} color="#2563eb" />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#0f172a"
                      }}
                    >
                      Create New Cashier
                    </h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                      Fill in details to add a cashier
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCashierModal(false)}
                  style={{
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    cursor: "pointer",
                    borderRadius: "8px",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f1f5f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                >
                  <X size={15} color="#64748b" />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "22px 24px 24px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#64748b",
                    display: "block",
                    marginBottom: "5px",
                    letterSpacing: "0.04em"
                  }}
                >
                  FULL NAME
                </label>
                <input
                  placeholder="e.g. Ravi Kumar"
                  value={cashierForm.name}
                  onChange={(e) =>
                    setCashierForm({ ...cashierForm, name: e.target.value })
                  }
                  style={inputStyle}
                />

                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#64748b",
                    display: "block",
                    marginBottom: "5px",
                    marginTop: "2px",
                    letterSpacing: "0.04em"
                  }}
                >
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  placeholder="e.g. ravi@store.com"
                  value={cashierForm.email}
                  onChange={(e) =>
                    setCashierForm({ ...cashierForm, email: e.target.value })
                  }
                  style={inputStyle}
                />

                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#64748b",
                    display: "block",
                    marginBottom: "5px",
                    marginTop: "2px",
                    letterSpacing: "0.04em"
                  }}
                >
                  PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={cashierForm.password}
                  onChange={(e) =>
                    setCashierForm({ ...cashierForm, password: e.target.value })
                  }
                  style={{ ...inputStyle, marginBottom: "22px" }}
                />

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handleCreateCashier}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      letterSpacing: "0.01em",
                      boxShadow: "0 2px 8px rgba(59,130,246,0.28)",
                      transition: "opacity 0.15s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Create Cashier
                  </button>

                  <button
                    onClick={() => setShowCashierModal(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#fff",
                      color: "#374151",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;