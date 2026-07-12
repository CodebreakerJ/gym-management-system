import axios from "axios";

import {
  clearAuthData,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "../utils/authStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

let isRefreshing = false;
let waitingRequests = [];

function processWaitingRequests(error, token = null) {
  waitingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  waitingRequests = [];
}

axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const isLoginRequest =
      originalRequest?.url?.includes("/login/");

    const isRefreshRequest =
      originalRequest?.url?.includes(
        "/token/refresh/"
      );

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isLoginRequest ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitingRequests.push({
          resolve,
          reject,
        });
      }).then((newAccessToken) => {
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        throw new Error(
          "Refresh token is not available."
        );
      }

      const refreshResponse = await axios.post(
        `${API_BASE_URL}/token/refresh/`,
        {
          refresh: refreshToken,
        }
      );

      const newAccessToken =
        refreshResponse.data.access;

      const newRefreshToken =
        refreshResponse.data.refresh ||
        refreshToken;

      saveTokens(
        newAccessToken,
        newRefreshToken
      );

      processWaitingRequests(
        null,
        newAccessToken
      );

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return axiosClient(originalRequest);
    } catch (refreshError) {
      processWaitingRequests(
        refreshError,
        null
      );

      clearAuthData();

      window.location.assign("/login");

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;