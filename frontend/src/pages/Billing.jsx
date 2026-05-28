import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { getProductByBarcode, getProducts, checkout } from "../services/api";
import { Trash2, Search, ScanLine, Printer, X } from "lucide-react";
import toast from "react-hot-toast";
import { saveToQueue, getQueue, clearQueue } from "../utils/offlineQueue";

const Billing = () => {
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [lastBill, setLastBill] = useState(null);

  const total = cart.reduce((s, i) => s + i.subtotal, 0);

  const addToCart = (product) => {
    const existing = cart.find(i => i.productId === product._id);
    if (existing) {
      setCart(cart.map(i =>
        i.productId === product._id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
          : i
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
        subtotal: product.price
      }]);
    }
    setSearchResults([]);
    setSearch("");
    toast.success(`${product.name} added`);
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    try {
      const { data } = await getProductByBarcode(barcode.trim());
      addToCart(data);
      setBarcode("");
    } catch {
      toast.error("Product not found for this barcode");
    }
  };

  const handleSearch = async (val) => {
    setSearch(val);
    if (val.length < 2) return setSearchResults([]);
    const { data } = await getProducts({ search: val });
    setSearchResults(data.slice(0, 5));
  };

  const updateQty = (productId, qty) => {
    const item = cart.find(i => i.productId === productId);
    if (qty < 1) return removeItem(productId);
    if (qty > item.stock) {
      toast.error(`Only ${item.stock} in stock`);
      return;
    }
    setCart(cart.map(i =>
      i.productId === productId
        ? { ...i, quantity: qty, subtotal: qty * i.unitPrice }
        : i
    ));
  };

  const removeItem = (productId) =>
    setCart(cart.filter(i => i.productId !== productId));

  const syncOfflineQueue = async () => {
    const queue = getQueue();
    if (!queue.length) return;
    let synced = 0;
    for (const tx of queue) {
      try {
        await checkout({ items: tx.items, paymentMethod: tx.paymentMethod });
        synced++;
      } catch { }
    }
    if (synced > 0) {
      clearQueue();
      toast.success(`${synced} offline bill(s) synced!`);
    }
  };

  const handleCheckout = async () => {
    if (!cart.length) return toast.error("Cart is empty");
    if (!navigator.onLine) {
      saveToQueue({
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod
      });
      toast("No internet — bill saved locally. Will sync when online.", {
        icon: "📦",
        style: { background: "#fff7ed", color: "#c2410c" }
      });
      setCart([]);
      return;
    }
    try {
      const { data } = await checkout({
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod
      });
      setLastBill(data);
      setCart([]);
      toast.success("Bill generated successfully!");
      await syncOfflineQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    }
  };

  const paymentIcons = { cash: "💵", card: "💳", upi: "📲" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <Sidebar />
      <main style={{
        marginLeft: "240px", flex: 1, padding: "36px 40px",
        display: "grid", gridTemplateColumns: "1fr 370px", gap: "24px",
        maxWidth: "calc(100% - 240px)"
      }}>

        {/* ── Left — Cart ── */}
        <div style={{ minWidth: 0 }}>
          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <p style={{
              margin: "0 0 2px", fontSize: "12px", fontWeight: 600,
              letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase"
            }}>
              Point of Sale
            </p>
            <h2 style={{
              margin: 0, fontSize: "24px", fontWeight: 700,
              color: "#0f172a", letterSpacing: "-0.3px"
            }}>
              Billing
            </h2>
          </div>

          {/* Input Card */}
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "22px 24px",
            marginBottom: "20px", border: "1px solid #e8edf2",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            {/* Barcode row */}
            <form onSubmit={handleBarcodeSubmit} style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <ScanLine size={15} style={{
                  position: "absolute", left: "13px", top: "50%",
                  transform: "translateY(-50%)", color: "#94a3b8"
                }} />
                <input
                  placeholder="Type barcode number manually..."
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 12px 11px 38px",
                    border: "1.5px solid #e2e8f0", borderRadius: "10px",
                    fontSize: "13.5px", boxSizing: "border-box",
                    background: "#f8fafc", color: "#0f172a", outline: "none",
                    transition: "border-color 0.18s"
                  }}
                  onFocus={e => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
              <button type="submit" style={{
                padding: "11px 20px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer",
                fontWeight: 600, fontSize: "13.5px", letterSpacing: "0.01em",
                boxShadow: "0 2px 8px rgba(59,130,246,0.28)", transition: "opacity 0.15s"
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Add
              </button>
            </form>

            {/* Product name search */}
            <div style={{ position: "relative" }}>
              <Search size={15} style={{
                position: "absolute", left: "13px", top: "50%",
                transform: "translateY(-50%)", color: "#94a3b8"
              }} />
              <input
                placeholder="Search product by name..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                style={{
                  width: "100%", padding: "11px 12px 11px 38px",
                  border: "1.5px solid #e2e8f0", borderRadius: "10px",
                  fontSize: "13.5px", boxSizing: "border-box",
                  background: "#f8fafc", color: "#0f172a", outline: "none",
                  transition: "border-color 0.18s"
                }}
                onFocus={e => (e.target.style.borderColor = "#3b82f6")}
                onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
              />

              {searchResults.length > 0 && (
                <div style={{
                  position: "absolute", top: "110%", left: 0, right: 0,
                  background: "#fff", border: "1.5px solid #e2e8f0",
                  borderRadius: "12px", zIndex: 10,
                  boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                  overflow: "hidden"
                }}>
                  {searchResults.map((p, idx) => (
                    <div
                      key={p._id}
                      onClick={() => addToCart(p)}
                      style={{
                        padding: "11px 16px", cursor: "pointer",
                        fontSize: "13.5px", display: "flex",
                        justifyContent: "space-between", alignItems: "center",
                        borderBottom: idx < searchResults.length - 1 ? "1px solid #f1f5f9" : "none",
                        transition: "background 0.12s"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f0f7ff")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                    >
                      <span style={{ color: "#0f172a", fontWeight: 500 }}>{p.name}</span>
                      <span style={{
                        color: "#2563eb", fontWeight: 700, fontSize: "13px",
                        background: "#eff6ff", padding: "2px 9px", borderRadius: "20px"
                      }}>
                        ₹{p.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Table */}
          <div style={{
            background: "#fff", borderRadius: "16px",
            border: "1px solid #e8edf2",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)", overflow: "hidden"
          }}>
            <div style={{
              padding: "16px 20px 12px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>
                Cart
              </p>
              {cart.length > 0 && (
                <span style={{
                  fontSize: "12px", fontWeight: 600, color: "#3b82f6",
                  background: "#eff6ff", padding: "2px 10px", borderRadius: "20px"
                }}>
                  {cart.length} item{cart.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  {["Product", "Price", "Qty", "Subtotal", ""].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "10px 16px",
                      fontSize: "11.5px", color: "#94a3b8",
                      fontWeight: 700, letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #e9edf2"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "48px 20px", textAlign: "center" }}>
                      <div style={{
                        width: "44px", height: "44px", borderRadius: "12px",
                        background: "#f1f5f9", display: "flex", alignItems: "center",
                        justifyContent: "center", margin: "0 auto 12px"
                      }}>
                        <ScanLine size={20} color="#cbd5e1" />
                      </div>
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: "13.5px" }}>
                        Cart is empty — scan or search a product
                      </p>
                    </td>
                  </tr>
                ) : cart.map((item, idx) => (
                  <tr
                    key={item.productId}
                    style={{
                      borderTop: "1px solid #f8fafc",
                      background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                      transition: "background 0.12s"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f0f7ff")}
                    onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbfc")}
                  >
                    <td style={{ padding: "13px 16px", fontSize: "13.5px", fontWeight: 600, color: "#0f172a" }}>
                      {item.productName}
                    </td>

                    <td style={{ padding: "13px 16px", fontSize: "13.5px", color: "#64748b" }}>
                      ₹{item.unitPrice}
                    </td>

                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          style={{
                            width: "28px", height: "28px",
                            border: "1.5px solid #e2e8f0", borderRadius: "8px",
                            background: "#f8fafc", cursor: "pointer",
                            fontSize: "16px", lineHeight: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#374151", fontWeight: 600, transition: "background 0.12s"
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#f8fafc")}
                        >
                          −
                        </button>

                        <span style={{
                          fontSize: "14px", fontWeight: 700,
                          minWidth: "28px", textAlign: "center", color: "#0f172a"
                        }}>
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          style={{
                            width: "28px", height: "28px",
                            border: "1.5px solid #e2e8f0", borderRadius: "8px",
                            background: "#f8fafc", cursor: "pointer",
                            fontSize: "16px", lineHeight: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#374151", fontWeight: 600, transition: "background 0.12s"
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#f8fafc")}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: "13px 16px", fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                      ₹{item.subtotal.toFixed(2)}
                    </td>

                    <td style={{ padding: "13px 16px" }}>
                      <button
                        onClick={() => removeItem(item.productId)}
                        style={{
                          background: "#fef2f2", border: "1px solid #fee2e2",
                          borderRadius: "8px", padding: "6px 9px",
                          cursor: "pointer", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          transition: "background 0.12s"
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#fef2f2")}
                      >
                        <Trash2 size={14} color="#dc2626" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right — Summary ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Order Summary Card */}
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "24px",
            border: "1px solid #e8edf2", boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
          }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
              Order Summary
            </h3>

            {/* Items count */}
            {cart.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                {cart.map(item => (
                  <div key={item.productId} style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: "13px", color: "#64748b", marginBottom: "6px"
                  }}>
                    <span style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.productName} × {item.quantity}
                    </span>
                    <span>₹{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div style={{
              borderTop: "2px solid #0f172a", paddingTop: "14px",
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "22px"
            }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Total</span>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "#2563eb" }}>
                ₹{total.toFixed(2)}
              </span>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                fontSize: "11.5px", fontWeight: 700, color: "#94a3b8",
                display: "block", marginBottom: "10px",
                letterSpacing: "0.07em", textTransform: "uppercase"
              }}>
                Payment Method
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {["cash", "card", "upi"].map(m => (
                  <label
                    key={m}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      cursor: "pointer", padding: "10px 14px",
                      borderRadius: "10px", border: "1.5px solid",
                      borderColor: paymentMethod === m ? "#3b82f6" : "#e2e8f0",
                      background: paymentMethod === m ? "#eff6ff" : "#f8fafc",
                      transition: "all 0.15s"
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m}
                      checked={paymentMethod === m}
                      onChange={() => setPaymentMethod(m)}
                      style={{ accentColor: "#3b82f6" }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: paymentMethod === m ? 600 : 400, color: paymentMethod === m ? "#1d4ed8" : "#374151" }}>
                      {paymentIcons[m]}&nbsp;&nbsp;{m.charAt(0).toUpperCase() + m.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: "#fff", border: "none", borderRadius: "12px",
                fontSize: "15px", fontWeight: 700, cursor: "pointer",
                letterSpacing: "0.01em",
                boxShadow: "0 2px 10px rgba(59,130,246,0.32)",
                transition: "opacity 0.15s"
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Generate Bill
            </button>
          </div>

          {/* Last Bill Card */}
          {lastBill && (
            <div style={{
              background: "#fff", borderRadius: "16px", padding: "22px 24px",
              border: "1px solid #e8edf2", boxShadow: "0 1px 4px rgba(15,23,42,0.05)"
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "14px"
              }}>
                <div>
                  <h3 style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                    Last Bill
                  </h3>
                  <span style={{
                    fontSize: "11.5px", fontWeight: 600,
                    fontFamily: "monospace", color: "#94a3b8",
                    background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px"
                  }}>
                    #{lastBill._id.slice(-8).toUpperCase()}
                  </span>
                </div>

                <button
                  onClick={() => window.print()}
                  style={{
                    background: "#f1f5f9", border: "1px solid #e2e8f0",
                    borderRadius: "8px", padding: "7px 12px",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    gap: "6px", fontSize: "12.5px", fontWeight: 600, color: "#374151",
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#e9edf2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#f1f5f9")}
                >
                  <Printer size={13} /> Print
                </button>
              </div>

              <div style={{ marginBottom: "12px" }}>
                {lastBill.items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: "13px", marginBottom: "7px",
                      color: "#374151", padding: "4px 0",
                      borderBottom: i < lastBill.items.length - 1 ? "1px dashed #f1f5f9" : "none"
                    }}
                  >
                    <span style={{ color: "#64748b" }}>
                      {item.productName} <span style={{ color: "#94a3b8" }}>× {item.quantity}</span>
                    </span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              <div style={{
                borderTop: "2px solid #0f172a", paddingTop: "10px",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: "18px", color: "#2563eb" }}>
                  ₹{lastBill.totalAmount}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Billing;