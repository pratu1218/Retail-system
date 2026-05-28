import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------- INPUT FIELD (MOVED OUTSIDE) -------------------- */
const InputField = ({ label, type = "text", value, onChange, error }) => {
  return (
    <div style={{ marginBottom: "24px" }}>
      <label
        style={{
          display: "block",
          fontSize: "14px",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        style={{
          width: "100%",
          height: "52px",
          padding: "0 16px",
          background: error
            ? "rgba(248, 113, 113, 0.1)"
            : "rgba(255, 255, 255, 0.9)",
          border: error
            ? "2px solid #f87171"
            : "2px solid rgba(229, 231, 235, 0.8)",
          borderRadius: "16px",
          fontSize: "15px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      {error && (
        <p
          style={{
            color: "#f87171",
            fontSize: "13px",
            marginTop: "6px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */
const Login = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    shopName: "",
  });

  const [errors, setErrors] = useState({});

  /* -------------------- VALIDATION -------------------- */
  const validate = () => {
    const newErrors = {};

    if (isRegister && !form.name.trim())
      newErrors.name = "Name is required";

    if (isRegister && !form.shopName.trim())
      newErrors.shopName = "Shop name is required";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email";

    if (!form.password.trim())
      newErrors.password = "Password required";
    else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/.test(
        form.password
      )
    )
      newErrors.password =
        "Password must have upper, lower, number (min 6 chars)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (isRegister) {
      register(
        form.name,
        form.email,
        form.password,
        "admin",
        form.shopName
      );
    } else {
      login(form.email, form.password);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* CARD ANIMATION ONLY HERE (SAFE) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "40px 30px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ margin: 0 }}>RetailPro</h1>
          <p style={{ color: "#555", marginTop: "8px" }}>
            {isRegister
              ? "Create your shop account"
              : "Sign in to your account"}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <InputField
                  label="Full Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  error={errors.name}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            error={errors.email}
          />

          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            error={errors.password}
          />

          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <InputField
                  label="Shop Name"
                  value={form.shopName}
                  onChange={(e) =>
                    setForm({ ...form, shopName: e.target.value })
                  }
                  error={errors.shopName}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* BUTTON */}
          <button
            type="submit"
            style={{
              width: "100%",
              height: "50px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {isRegister ? "Create Shop" : "Sign In"}
          </button>
        </form>

        {/* TOGGLE */}
        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <p>
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}
          </p>

          <span
            onClick={() => {
              setIsRegister(!isRegister);
              setErrors({});
            }}
            style={{
              color: "#6366f1",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {isRegister ? "Sign in" : "Register"}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;