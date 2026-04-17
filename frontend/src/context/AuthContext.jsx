import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [userInfo, setUserInfo] = useState(
    JSON.parse(sessionStorage.getItem("userInfo") || "null")
  );

  const navigate = useNavigate();

  const login = async (email, password) => {
    try {

      const { data } = await loginUser({ email, password });

      // ✅ Ensure shopName exists
      const updatedUser = {
        ...data,
        shopName: data.shopName || "Your Store"
      };

      sessionStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setUserInfo(updatedUser);

      toast.success(`Welcome back, ${data.name}!`);
      navigate("/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  const register = async (name, email, password, role, shopName) => {
    try {

      const { data } = await registerUser({
        name,
        email,
        password,
        role,
        shopName
      });

      const updatedUser = {
        ...data,
        shopName: shopName || "Your Store"
      };

      sessionStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setUserInfo(updatedUser);

      toast.success("Account created successfully!");
      navigate("/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("userInfo");
    setUserInfo(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);