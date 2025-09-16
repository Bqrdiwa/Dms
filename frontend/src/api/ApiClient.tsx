import { addToast } from "@heroui/react";
import axios from "axios";
import { APPLICATION_TITLE, BACKEND_BASE_URL } from "./Setting";
const apiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
apiClient.interceptors.response.use(
  (response) => {
    if (response.data.message) {
      addToast({
        title: APPLICATION_TITLE,
        description: response.data.message,
        color: "success",
      });
    }
    return response;
  },
  (error) => {
    const detail = error.response?.data.message;
    const dancercodes = [429];
    console.log(detail);
    detail &&
      addToast({
        title: APPLICATION_TITLE,
        description: detail,
        color: dancercodes.includes(error.status) ? "warning" : "danger",
      });

    if (
      error.response?.data.code === "token_not_valid" ||
      error.status == 401
    ) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      if (!detail) {
        addToast({
          title: APPLICATION_TITLE,
          description: "Your token is expired...",
          color: "warning",
        });
        window.location.href = "/auth/#login";
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export const setLocalStorageTokens = (responseData: {
  access: string;
  refresh: string;
}) => {
  localStorage.setItem("access", responseData.access);
  localStorage.setItem("refresh", responseData.refresh);
};

export default apiClient;
