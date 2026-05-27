import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
  socket.emit("ping", { msg: "Hello server" });
});

socket.on("pong", (data) => {
  console.log("📩 Received from server:", data);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection failed:", err.message);
});
