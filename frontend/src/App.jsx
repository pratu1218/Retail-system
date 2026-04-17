import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import AiInsights from "./pages/AiInsights";
import Chatbot from "./components/Chatbot";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Both admin and cashier */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute><Billing /></ProtectedRoute>
        } />

        {/* Admin and cashier can view inventory
            but cashier cannot add/edit/delete
            — controlled inside Inventory.jsx */}
        <Route path="/inventory" element={
          <ProtectedRoute><Inventory /></ProtectedRoute>
        } />

        {/* Admin only */}
        <Route path="/analytics" element={
          <ProtectedRoute adminOnly><Analytics /></ProtectedRoute>
        } />
        <Route path="/ai-insights" element={
          <ProtectedRoute adminOnly><AiInsights /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Chatbot Added Here */}
      <Chatbot />

    </AuthProvider>
  </BrowserRouter>
);

export default App;