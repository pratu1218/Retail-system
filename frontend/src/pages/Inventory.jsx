import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api";
import { Plus, Pencil, Trash2, Search, ScanLine, X, Package, ChevronUp, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import BarcodeScanner from "../components/BarcodeScanner";
import { useAuth } from "../context/AuthContext";

const empty = {
  name: "", category: "", price: "",
  quantity: "", lowStockThreshold: 10,
  barcode: "", description: ""
};

const Inventory = () => {

  const { userInfo } = useAuth();
  const isAdmin = userInfo?.role === "admin";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [showScanner, setShowScanner] = useState(false);

  const load = () => getProducts({ search }).then(r => setProducts(r.data));
  useEffect(() => { load(); }, [search]);

  const openAdd = () => {
    if (!isAdmin) return;
    setForm(empty);
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    if (!isAdmin) return;

    setForm({
      name: p.name, category: p.category || "",
      price: p.price, quantity: p.quantity,
      lowStockThreshold: p.lowStockThreshold,
      barcode: p.barcode || "", description: p.description || ""
    });
    setEditing(p._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      if (editing) {
        await updateProduct(editing, form);
        toast.success("Product updated");
      } else {
        await createProduct(form);
        toast.success("Product added");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving product");
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleBarcodeScan = (code) => {
    setForm(prev => ({ ...prev, barcode: code }));
    setShowScanner(false);
    toast.success(`Barcode captured: ${code}`);
  };

  // Helper functions to increment/decrement with validation
  const incrementValue = (field, min = 0) => {
    const currentValue = parseFloat(form[field]) || 0;
    setForm({ ...form, [field]: currentValue + 1 });
  };

  const decrementValue = (field, min = 0) => {
    const currentValue = parseFloat(form[field]) || 0;
    if (currentValue > min) {
      setForm({ ...form, [field]: currentValue - 1 });
    }
  };

  const handleNumberChange = (field, value, min = 0) => {
    const numValue = parseFloat(value);
    if (value === "" || (numValue >= min)) {
      setForm({ ...form, [field]: value });
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{ marginLeft: "240px", flex: 1, padding: "32px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>Inventory</h2>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
              {products.length} products
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={openAdd}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
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
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <Search size={16} style={{
            position: "absolute", left: "12px", top: "50%",
            transform: "translateY(-50%)", color: "#94a3b8"
          }} />
          <input
            placeholder="Search products by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px 10px 36px",
              border: "1px solid #e2e8f0", borderRadius: "8px",
              fontSize: "14px", outline: "none",
              boxSizing: "border-box", background: "#fff"
            }}
          />
        </div>

        {/* Products Table */}
        <div style={{
          background: "#fff", borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                {["Product", "Category", "Price", "Stock", "Barcode", "Status", ...(isAdmin ? ["Actions"] : [])].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "12px 16px",
                    fontSize: "12px", color: "#64748b", fontWeight: 600
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{
                    padding: "40px", textAlign: "center",
                    color: "#94a3b8", fontSize: "14px"
                  }}>
                    No products found. Click "Add Product" to get started.
                  </td>
                </tr>
              ) : products.map(p => (
                <tr key={p._id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                      {p.name}
                    </p>
                    {p.description && (
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                        {p.description}
                      </p>
                    )}
                  </td>

                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#374151" }}>
                    {p.category || "—"}
                  </td>

                  <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                    ₹{p.price}
                  </td>

                  <td style={{ padding: "12px 16px", fontSize: "14px", color: "#374151" }}>
                    {p.quantity} units
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    {p.barcode ? (
                      <span style={{
                        fontFamily: "monospace", fontSize: "12px",
                        background: "#f1f5f9", padding: "3px 8px",
                        borderRadius: "4px", color: "#374151"
                      }}>
                        {p.barcode}
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>No barcode</span>
                    )}
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: "999px",
                      fontSize: "11px", fontWeight: 600,
                      background: p.isLowStock ? "#fef2f2" : "#f0fdf4",
                      color: p.isLowStock ? "#dc2626" : "#16a34a"
                    }}>
                      {p.isLowStock ? "Low Stock" : "In Stock"}
                    </span>
                  </td>

                  {isAdmin && (
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => openEdit(p)}
                          style={{
                            background: "#eff6ff", border: "none",
                            borderRadius: "6px", padding: "6px 8px", cursor: "pointer"
                          }}
                        >
                          <Pencil size={14} color="#3b82f6" />
                        </button>

                        <button
                          onClick={() => handleDelete(p._id)}
                          style={{
                            background: "#fef2f2", border: "none",
                            borderRadius: "6px", padding: "6px 8px", cursor: "pointer"
                          }}
                        >
                          <Trash2 size={14} color="#dc2626" />
                        </button>
                      </div>
                    </td>
                  )}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Enhanced Modal */}
      {showModal && isAdmin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            animation: "fadeIn 0.2s ease"
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "540px",
              maxWidth: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              animation: "slideUp 0.3s ease"
            }}
            onClick={e => e.stopPropagation()}
          >

            {/* Modal header */}
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
                  <Package size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                    {editing ? "Edit Product" : "Add New Product"}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                    {editing ? "Update product details" : "Add a product to your inventory"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
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
                onMouseOver={e => e.currentTarget.style.background = "#f1f5f9"}
                onMouseOut={e => e.currentTarget.style.background = "#f8fafc"}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>

              {/* Product Name */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#334155"
                }}>
                  Product Name *
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Maggi Noodles"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
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

              {/* Category */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#334155"
                }}>
                  Category
                </label>
                <input
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Grocery"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
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

              {/* Description */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#334155"
                }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description (optional)"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "vertical"
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

              {/* Barcode */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#334155"
                }}>
                  Barcode
                </label>

                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    value={form.barcode}
                    onChange={e => setForm({ ...form, barcode: e.target.value })}
                    placeholder="Scan or type barcode"
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
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

                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    style={{
                      padding: "12px 16px",
                      background: "#0f172a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: 600,
                      fontSize: "13px",
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "#1e293b"}
                    onMouseOut={e => e.currentTarget.style.background = "#0f172a"}
                  >
                    <ScanLine size={16} /> Scan
                  </button>
                </div>
              </div>

              {/* Price, Quantity, Low Stock with increment/decrement */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                marginBottom: "24px"
              }}>
                {/* Price */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#334155"
                  }}>
                    Price (₹) *
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => handleNumberChange("price", e.target.value, 0)}
                      min="0"
                      step="0.01"
                      required
                      style={{
                        width: "100%",
                        padding: "12px 32px 12px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
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
                    <div style={{
                      position: "absolute",
                      right: "4px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px"
                    }}>
                      <button
                        type="button"
                        onClick={() => incrementValue("price", 0)}
                        style={{
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: "4px",
                          padding: "2px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "20px",
                          height: "16px"
                        }}
                      >
                        <ChevronUp size={12} color="#64748b" />
                      </button>
                      <button
                        type="button"
                        onClick={() => decrementValue("price", 0)}
                        style={{
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: "4px",
                          padding: "2px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "20px",
                          height: "16px"
                        }}
                      >
                        <ChevronDown size={12} color="#64748b" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#334155"
                  }}>
                    Quantity *
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      value={form.quantity}
                      onChange={e => handleNumberChange("quantity", e.target.value, 0)}
                      min="0"
                      required
                      style={{
                        width: "100%",
                        padding: "12px 32px 12px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
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
                    <div style={{
                      position: "absolute",
                      right: "4px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px"
                    }}>
                      <button
                        type="button"
                        onClick={() => incrementValue("quantity", 0)}
                        style={{
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: "4px",
                          padding: "2px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "20px",
                          height: "16px"
                        }}
                      >
                        <ChevronUp size={12} color="#64748b" />
                      </button>
                      <button
                        type="button"
                        onClick={() => decrementValue("quantity", 0)}
                        style={{
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: "4px",
                          padding: "2px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "20px",
                          height: "16px"
                        }}
                      >
                        <ChevronDown size={12} color="#64748b" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Low Stock Threshold */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#334155"
                  }}>
                    Low Stock
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      value={form.lowStockThreshold}
                      onChange={e => handleNumberChange("lowStockThreshold", e.target.value, 0)}
                      min="0"
                      style={{
                        width: "100%",
                        padding: "12px 32px 12px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
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
                    <div style={{
                      position: "absolute",
                      right: "4px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px"
                    }}>
                      <button
                        type="button"
                        onClick={() => incrementValue("lowStockThreshold", 0)}
                        style={{
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: "4px",
                          padding: "2px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "20px",
                          height: "16px"
                        }}
                      >
                        <ChevronUp size={12} color="#64748b" />
                      </button>
                      <button
                        type="button"
                        onClick={() => decrementValue("lowStockThreshold", 0)}
                        style={{
                          background: "#f1f5f9",
                          border: "none",
                          borderRadius: "4px",
                          padding: "2px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "20px",
                          height: "16px"
                        }}
                      >
                        <ChevronDown size={12} color="#64748b" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

                <button
                  type="submit"
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
                  <Package size={16} />
                  {editing ? "Update Product" : "Add Product"}
                </button>
              </div>

            </form>
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

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

    </div>
  );
};

export default Inventory;