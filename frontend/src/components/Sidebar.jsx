import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Package, Receipt,
  BarChart2, Brain, LogOut
} from "lucide-react";

const adminLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/billing", icon: Receipt, label: "Billing" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/ai-insights", icon: Brain, label: "AI Insights" },
];

const cashierLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/billing", icon: Receipt, label: "Billing" },
];

const Sidebar = () => {
  const { logout, userInfo } = useAuth();
  const isAdmin = userInfo?.role === "admin";
  const links = isAdmin ? adminLinks : cashierLinks;

  return (
    <aside style={{
      width: "240px", minHeight: "100vh", background: "#1e293b",
      display: "flex", flexDirection: "column", padding: "24px 0",
      position: "fixed", top: 0, left: 0, zIndex: 100
    }}>
      {/* Logo + user info */}
      <div style={{ padding: "0 24px 32px" }}>
        <h1 style={{
          color: "#f1f5f9", fontSize: "18px",
          fontWeight: 700, margin: 0
        }}>
          RetailPro
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "12px", margin: "4px 0 0" }}>
          {userInfo?.name}
        </p>
        <span style={{
          display: "inline-block", marginTop: "6px",
          padding: "2px 10px", borderRadius: "999px", fontSize: "11px",
          fontWeight: 700,
          background: isAdmin ? "#3b82f6" : "#8b5cf6",
          color: "#fff"
        }}>
          {isAdmin ? "Admin" : "Cashier"}
        </span>
      </div>

      {/* Nav links */}
      <nav style={{
        flex: 1, display: "flex", flexDirection: "column",
        gap: "4px", padding: "0 12px"
      }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: "12px",
            padding: "10px 12px", borderRadius: "8px",
            textDecoration: "none",
            color: isActive ? "#f1f5f9" : "#94a3b8",
            background: isActive ? "#334155" : "transparent",
            fontSize: "14px", fontWeight: isActive ? 600 : 400,
            transition: "all 0.15s"
          })}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "0 12px" }}>
        <button onClick={logout} style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "10px 12px", borderRadius: "8px", border: "none",
          background: "transparent", color: "#94a3b8",
          fontSize: "14px", cursor: "pointer", width: "100%"
        }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;