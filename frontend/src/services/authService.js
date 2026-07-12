import axiosClient from "../api/axiosClient";

import {
  clearAuthData,
  getRefreshToken,
  saveAuthData,
} from "../utils/authStorage";

export async function loginUser(credentials) {
  const response = await axiosClient.post(
    "/login/",
    credentials
  );

  saveAuthData(response.data);

  return response.data;
}

export async function logoutUser() {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await axiosClient.post("/logout/", {
        refresh: refreshToken,
      });
    }
  } finally {
    clearAuthData();
  }
}