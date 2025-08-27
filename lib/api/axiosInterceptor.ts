import axios from "axios";

// Create an axios instance
export const api = axios.create({
  baseURL: "/api", 
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject the Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  },
);

// Optional: Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Unauthorized (e.g., logout user)
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/auth/login"; // Redirect to login
    }
    return Promise.reject(error);
  },
);
