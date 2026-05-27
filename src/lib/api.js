import { clearStoredAuth, getStoredAuth, setStoredAuth } from "./storage";

// const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://172.21.224.1:5000";
// Replace the local IP with your specific Localtunnel URL
// In your api.js
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "https://ledger-app-5azc.onrender.com";

export const getCurrentUserId = async () => {
  const { userId } = await getStoredAuth();
  return userId;
};

export const getToken = async () => {
  const { token } = await getStoredAuth();
  return token;
};

export const setAuthData = async ({ token, user }) => {
  await setStoredAuth({ token, user });
};

export const clearAuthData = async () => {
  await clearStoredAuth();
};

const request = async (path, options = {}) => {
  const [token, userId] = await Promise.all([getToken(), getCurrentUserId()]);

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { "x-user-id": userId } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const data = response.status === 204 ? {} : await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        await clearAuthData();
      }

      throw new Error(data.error || data.message || `Error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    request(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  patch: (path, body, options) =>
    request(path, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  put: (path, body, options) =>
    request(path, { ...options, method: "PUT", body: JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
