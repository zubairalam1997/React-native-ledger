import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getCurrentUserId } from "../lib/api";

const NotificationContext = createContext(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const refreshNotifications = useCallback(async () => {
    if (!(await getCurrentUserId())) {
      setNotifications([]);
      return;
    }

    const data = await api.get("/notifications");
    setNotifications(data.notifications || data.data?.notifications || []);
  }, []);

  useEffect(() => {
    refreshNotifications().catch((error) => {
      console.error("Failed to load notifications", error);
    });
  }, [refreshNotifications]);

  const pushNotification = async (notification) => {
    if (!(await getCurrentUserId())) {
      throw new Error("Please login first");
    }

    const data = await api.post("/notifications", notification);
    const savedNotification = data.notification || data.data?.notification;
    setNotifications((prev) => [savedNotification, ...prev]);
    return savedNotification;
  };

  const updateNotificationStatus = async (id, status) => {
    if (!(await getCurrentUserId())) {
      throw new Error("Please login first");
    }

    const data = await api.patch(`/notifications/${id}`, { status });
    const updatedNotification = data.notification || data.data?.notification;

    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? updatedNotification : notification))
    );

    return updatedNotification;
  };

  const value = useMemo(
    () => ({
      notifications,
      pushNotification,
      refreshNotifications,
      updateNotificationStatus,
    }),
    [notifications, refreshNotifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
