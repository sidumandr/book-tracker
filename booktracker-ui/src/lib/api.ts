import axios from "axios";

// Production: set NEXT_PUBLIC_API_URL (e.g. https://your-app.onrender.com/api)
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5002/api" : "");

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
