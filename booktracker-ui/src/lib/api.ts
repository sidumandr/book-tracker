import axios from "axios";

const defaultApiUrl =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://book-tracker-api-wjm0.onrender.com/api"
    : "http://localhost:5002/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

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
