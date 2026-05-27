import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { api, getCurrentUserId } from "../lib/api";
import { connectNotificationSocket, disconnectNotificationSocket } from "../lib/socket";

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
  const socketRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const addOrReplaceNotification = useCallback((notification) => {
    if (!notification?.id) {
      return;
    }

    setNotifications((prev) => {
      const exists = prev.some((item) => item.id === notification.id);
      if (exists) {
        return prev.map((item) => (item.id === notification.id ? { ...item, ...notification } : item));
      }

      return [notification, ...prev];
    });
  }, []);

  const connectSocket = useCallback(async () => {
    if (appStateRef.current !== "active") {
      return;
    }

    const socket = await connectNotificationSocket();
    if (!socket) {
      return;
    }

    if (appStateRef.current !== "active") {
      disconnectNotificationSocket();
      return;
    }

    if (socketRef.current === socket) {
      return;
    }

    socketRef.current = socket;

    socket.off("notification:new");
    socket.off("notification:updated");

    socket.on("notification:new", (notification) => {
      addOrReplaceNotification(notification);
    });

    socket.on("notification:updated", ({ id, status, ...rest }) => {
      if (status === "APPROVED" || status === "REJECTED") {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
        return;
      }

      addOrReplaceNotification({ id, status, ...rest });
    });

    socket.on("connect_error", (error) => {
      console.error("Notification socket connection failed", error.message);
    });
  }, [addOrReplaceNotification]);

  const refreshNotifications = useCallback(async () => {
    if (!(await getCurrentUserId())) {
      setNotifications([]);
      disconnectNotificationSocket();
      socketRef.current = null;
      return;
    }

    await connectSocket();

    const data = await api.get("/notifications");
    setNotifications(data.notifications || data.data?.notifications || []);
  }, [connectSocket]);

  useEffect(() => {
    refreshNotifications().catch((error) => {
      console.error("Failed to load notifications", error);
    });
  }, [refreshNotifications]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const wasActive = appStateRef.current === "active";
      appStateRef.current = nextAppState;

      if (nextAppState !== "active") {
        disconnectNotificationSocket();
        return;
      }

      if (!wasActive) {
        refreshNotifications().catch((error) => {
          console.error("Failed to reconnect notification socket", error);
        });
      }
    });

    return () => subscription.remove();
  }, [refreshNotifications]);

  useEffect(() => () => disconnectNotificationSocket(), []);

  const pushNotification = useCallback(async (notification) => {
    if (!(await getCurrentUserId())) {
      throw new Error("Please login first");
    }

    const data = await api.post("/notifications", notification);
    const savedNotification = data.notification || data.data?.notification;
    setNotifications((prev) => [savedNotification, ...prev]);
    return savedNotification;
  }, []);

  const updateNotificationStatus = useCallback(async (id, status) => {
    if (!(await getCurrentUserId())) {
      throw new Error("Please login first");
    }

    const data = await api.patch(`/notifications/${id}`, { status });
    const updatedNotification = data.notification || data.data?.notification;

    if (status === "CONFIRMED" || status === "REJECTED") {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
      return updatedNotification;
    }

    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? updatedNotification : notification))
    );

    return updatedNotification;
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      pushNotification,
      refreshNotifications,
      updateNotificationStatus,
    }),
    [notifications, pushNotification, refreshNotifications, updateNotificationStatus]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
