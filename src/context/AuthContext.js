import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearAuthData, setAuthData } from "../lib/api";
import { getStoredAuth } from "../lib/storage";

const AuthContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const stored = await getStoredAuth();
        setUser(stored.user || null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    hydrateAuth();
  }, []);

  const login = async ({ name, phoneNumber }) => {
    const response = await api.post("/auth/login", {
      name,
      phoneNumber,
      otp: "123456",
    });

    const loginData = response.data || response;
    if (!loginData?.accessToken || !loginData?.user) {
      throw new Error("No access token received from server");
    }

    await setAuthData({
      token: loginData.accessToken,
      user: loginData.user,
    });

    setUser(loginData.user);
    return loginData.user;
  };

  const logout = async () => {
    await clearAuthData();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isBootstrapping,
      login,
      logout,
      setUser,
    }),
    [isBootstrapping, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
