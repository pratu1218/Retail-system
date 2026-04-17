const StatCard = ({ title, value, subtitle, icon: Icon, color = "#3b82f6" }) => (
  <div style={{
    background: "#fff", borderRadius: "12px", padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9",
    display: "flex", alignItems: "flex-start", gap: "16px"
  }}>
    <div style={{
      width: "48px", height: "48px", borderRadius: "10px",
      background: color + "15", display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0
    }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{title}</p>
      <p style={{ margin: "4px 0 2px", fontSize: "26px", fontWeight: 700, color: "#0f172a" }}>{value}</p>
      {subtitle && <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{subtitle}</p>}
    </div>
  </div>
);

export default StatCard;