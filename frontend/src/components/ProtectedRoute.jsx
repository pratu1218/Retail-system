import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { userInfo } = useAuth();

  if (!userInfo) return <Navigate to="/login" replace />;

  if (adminOnly && userInfo.role !== "admin") {
    return (
      <div style={{
        marginLeft: "240px", flex: 1, minHeight: "100vh",
        background: "#f8fafc", display: "flex",
        alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "64px", marginBottom: "16px"
          }}>🔒</div>
          <h2 style={{
            margin: "0 0 8px", fontSize: "22px",
            fontWeight: 700, color: "#0f172a"
          }}>
            Access Denied
          </h2>
          <p style={{
            margin: "0 0 24px", color: "#64748b", fontSize: "15px"
          }}>
            This page is only accessible to admin users.
          </p>
          <a href="/billing" style={{
            padding: "10px 24px", background: "#3b82f6",
            color: "#fff", borderRadius: "8px",
            textDecoration: "none", fontSize: "14px", fontWeight: 600
          }}>
            Go to Billing
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;