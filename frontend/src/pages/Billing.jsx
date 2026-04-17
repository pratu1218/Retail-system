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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <main style={{
        marginLeft: "240px", flex: 1, padding: "32px",
        display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px"
      }}>

        {/* Left — Cart */}
        <div>
          <h2 style={{ margin: "0 0 24px", fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>
            Billing
          </h2>

          <div style={{
            background: "#fff", borderRadius: "12px", padding: "20px",
            marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }}>

            {/* Barcode row */}
            <form onSubmit={handleBarcodeSubmit} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <ScanLine size={16} style={{
                  position: "absolute", left: "12px", top: "50%",
                  transform: "translateY(-50%)", color: "#94a3b8"
                }} />
                <input
                  placeholder="Type barcode number manually..."
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 12px 10px 36px",
                    border: "1px solid #e2e8f0", borderRadius: "8px",
                    fontSize: "14px", boxSizing: "border-box"
                  }}
                />
              </div>

              <button type="submit" style={{
                padding: "10px 16px", background: "#3b82f6", color: "#fff",
                border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600
              }}>
                Add
              </button>

            </form>

            {/* Product name search */}
            <div style={{ position: "relative" }}>
              <Search size={16} style={{
                position: "absolute", left: "12px", top: "50%",
                transform: "translateY(-50%)", color: "#94a3b8"
              }} />
              <input
                placeholder="Search product by name..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px 10px 36px",
                  border: "1px solid #e2e8f0", borderRadius: "8px",
                  fontSize: "14px", boxSizing: "border-box"
                }}
              />

              {searchResults.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  zIndex: 10,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  {searchResults.map(p => (
                    <div
                      key={p._id}
                      onClick={() => addToCart(p)}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        fontSize: "14px",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between"
                      }}
                    >
                      <span>{p.name}</span>
                      <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                        ₹{p.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Cart table */}
          <div style={{
            background: "#fff", borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  {["Product", "Price", "Qty", "Subtotal", ""].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "12px 16px",
                      fontSize: "12px", color: "#64748b", fontWeight: 600
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{
                      padding: "40px", textAlign: "center",
                      color: "#94a3b8", fontSize: "14px"
                    }}>
                      Cart is empty — scan or search a product
                    </td>
                  </tr>
                ) : cart.map(item => (
                  <tr key={item.productId} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 500 }}>
                      {item.productName}
                    </td>

                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                      ₹{item.unitPrice}
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          style={{
                            width: "26px",
                            height: "26px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "4px",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: "16px",
                            lineHeight: 1
                          }}
                        >
                          −
                        </button>

                        <span style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          minWidth: "24px",
                          textAlign: "center"
                        }}>
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          style={{
                            width: "26px",
                            height: "26px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "4px",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: "16px",
                            lineHeight: 1
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td style={{
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: 600
                    }}>
                      ₹{item.subtotal.toFixed(2)}
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => removeItem(item.productId)}
                        style={{
                          background: "#fef2f2",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 8px",
                          cursor: "pointer"
                        }}
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

        {/* Right — Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          <div style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }}>

            <h3 style={{
              margin: "0 0 20px",
              fontSize: "16px",
              fontWeight: 700
            }}>
              Order Summary
            </h3>

            <div style={{
              borderTop: "2px solid #0f172a",
              paddingTop: "12px",
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px"
            }}>
              <span style={{
                fontSize: "18px",
                fontWeight: 700
              }}>
                Total
              </span>

              <span style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#3b82f6"
              }}>
                ₹{total.toFixed(2)}
              </span>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
                display: "block",
                marginBottom: "8px"
              }}>
                Payment Method
              </label>

              {["cash", "card", "upi"].map(m => (
                <label key={m} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value={m}
                    checked={paymentMethod === m}
                    onChange={() => setPaymentMethod(m)}
                  />
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </label>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              style={{
                width: "100%",
                padding: "14px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Generate Bill
            </button>

          </div>
          {lastBill && (
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px"
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700
                }}>
                  Last Bill
                </h3>

                <button
                  onClick={() => window.print()}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px"
                  }}
                >
                  <Printer size={14} /> Print
                </button>
              </div>

              <p style={{
                fontSize: "12px",
                color: "#94a3b8",
                margin: "0 0 12px"
              }}>
                #{lastBill._id.slice(-8).toUpperCase()}
              </p>

              {lastBill.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: "6px"
                  }}
                >
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>₹{item.subtotal}</span>
                </div>
              ))}

              <div style={{
                borderTop: "1px solid #f1f5f9",
                paddingTop: "10px",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700
              }}>
                <span>Total</span>
                <span>₹{lastBill.totalAmount}</span>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Billing;