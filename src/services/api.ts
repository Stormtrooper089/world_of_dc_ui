import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ApiResponse } from "../types";

import { config } from "../config/env";

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect for login/auth endpoints - let the component handle the error
      const url = error.config?.url || "";
      if (
        !url.includes("/auth/") &&
        !url.includes("/citizen/") &&
        !url.includes("/officer/")
      ) {
        // Token expired or invalid - redirect to login for protected endpoints
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
