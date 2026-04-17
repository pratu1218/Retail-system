import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((req) => {
  const user = JSON.parse(sessionStorage.getItem("userInfo") || "{}");

  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }

  return req;
});

// ================= AUTH =================

export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const createCashier = (data) => API.post("/auth/create-cashier", data);

// ================= PRODUCTS =================

export const getProducts = (params) => API.get("/products", { params });
export const getProductByBarcode = (barcode) => API.get(`/products/barcode/${barcode}`);
export const createProduct = (data) => API.post("/products", data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getLowStockProducts = () => API.get("/products/low-stock");

// ================= BILLING =================

export const checkout = (data) => API.post("/billing/checkout", data);
export const getTransactions = () => API.get("/billing/transactions");
export const getTransactionById = (id) => API.get(`/billing/transactions/${id}`);

// ================= ANALYTICS =================

export const getSummary = (period) => API.get(`/analytics/summary?period=${period}`);
export const getTopProducts = () => API.get("/analytics/top-products");
export const getDailySales = () => API.get("/analytics/daily-sales");

// ✅ ADDED (THIS FIXES YOUR ERROR)
export const getSmartInsights = () => API.get("/analytics/smart-insights");

// ================= AI =================

export const getRestockSuggestions = () => API.get("/ai/restock-suggestions");
export const getSlowMoving = () => API.get("/ai/slow-moving");

// ================= CHATBOT (AXIOS NORMAL) =================

export const sendChat = (data) => API.post("/chat", data);


// ==========================================================
// PROFESSIONAL CHAT STREAMING (FETCH VERSION)
// ==========================================================

const API_BASE_URL = "http://localhost:5000/api";

// Smart Chat (fetch version)
export const sendChatAdvanced = async ({
  message,
  conversationHistory = [],
  systemPrompt = null
}) => {
  try {

    const user = JSON.parse(sessionStorage.getItem("userInfo") || "{}");

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: user?.token ? `Bearer ${user.token}` : ""
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        systemPrompt
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };

  } catch (error) {
    console.error("Chat API Error:", error);
    throw error;
  }
};


// ================= STREAMING CHAT =================

export const sendChatStream = async ({
  message,
  conversationHistory = [],
  systemPrompt = null,
  onChunk
}) => {

  const user = JSON.parse(sessionStorage.getItem("userInfo") || "{}");

  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: user?.token ? `Bearer ${user.token}` : ""
    },
    body: JSON.stringify({
      message,
      conversationHistory,
      systemPrompt
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    fullResponse += chunk;

    onChunk(chunk, fullResponse);
  }

  return fullResponse;
};