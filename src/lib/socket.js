import { io } from "socket.io-client";
import { API_BASE_URL, getToken } from "./api";

let socket;

export const connectNotificationSocket = async () => {
  const token = await getToken();

  if (!token) {
    return null;
  }

  if (!socket) {
    socket = io(API_BASE_URL, {
      autoConnect: false,
      transports: ["polling", "websocket"],
      auth: { token },
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  } else {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectNotificationSocket = () => {
  socket?.disconnect();
};
