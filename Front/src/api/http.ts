import axios from "axios";
import { useAuthStore } from "../store/authStore";
// Example: Zustand/Redux

// Helper to clear token from auth store (Zustand pattern)
function clearToken() {
  useAuthStore.getState().logout();
}

// Helper to get token from auth store (Zustand pattern)
function getToken() {
  // Directly access the Zustand store state without using the hook
  return useAuthStore.getState().token;
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8009/api",
  timeout: 15000,
});

// Request interceptor → attach token
http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handle 401/403
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken(); // remove from store
      window.location.href = "/login"; // redirect
    }
    return Promise.reject(error);
  }
);

export default http;
