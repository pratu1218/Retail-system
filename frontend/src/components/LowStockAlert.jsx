import { AlertTriangle } from "lucide-react";

const LowStockAlert = ({ products }) => {
  if (!products?.length) return null;
  return (
    <div style={{
      background: "#fff7ed", border: "1px solid #fed7aa",
      borderRadius: "10px", padding: "16px 20px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <AlertTriangle size={18} color="#f97316" />
        <span style={{ fontWeight: 600, color: "#c2410c", fontSize: "14px" }}>
          {products.length} product{products.length > 1 ? "s" : ""} low on stock
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {products.map(p => (
          <span key={p._id} style={{
            background: "#fff", border: "1px solid #fed7aa", borderRadius: "6px",
            padding: "4px 10px", fontSize: "12px", color: "#9a3412"
          }}>
            {p.name} — {p.quantity} left
          </span>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlert;