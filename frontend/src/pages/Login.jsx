import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin", // default admin
    shopName: ""
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (isRegister && !form.name.trim())
      newErrors.name = "Name is required";

    if (isRegister && !form.shopName.trim())
      newErrors.shopName = "Shop name is required";

    if (!form.email.trim())
      newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email address";

    if (!form.password.trim())
      newErrors.password = "Password is required";
    else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/.test(form.password)
    )
      newErrors.password =
        "Password must contain uppercase, lowercase, number (min 6 chars)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (isRegister)
      register(
        form.name,
        form.email,
        form.password,
        "admin", // always admin
        form.shopName
      );
    else
      login(form.email, form.password);
  };

  const field = (label, key, type = "text") => (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 500,
          color: "#374151",
          marginBottom: "6px"
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={form[key]}
        onChange={(e) => {
          setForm({ ...form, [key]: e.target.value });
          setErrors({ ...errors, [key]: "" });
        }}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: errors[key] ? "1px solid #ef4444" : "1px solid #d1d5db",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          boxSizing: "border-box"
        }}
      />

      {errors[key] && (
        <p
          style={{
            color: "#ef4444",
            fontSize: "12px",
            marginTop: "4px"
          }}
        >
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
        }}
      >
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: "24px",
            fontWeight: 700,
            color: "#0f172a"
          }}
        >
          RetailPro
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            color: "#64748b",
            fontSize: "14px"
          }}
        >
          {isRegister ? "Create your shop account" : "Sign in to your account"}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && field("Full Name", "name")}
          {field("Email", "email", "email")}
          {field("Password", "password", "password")}
          {isRegister && field("Shop Name", "shopName")}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {isRegister ? "Create Shop" : "Sign In"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "#64748b"
          }}
        >
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <span
            onClick={() => {
              setIsRegister(!isRegister);
              setErrors({});
            }}
            style={{
              color: "#3b82f6",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            {isRegister ? "Sign in" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;