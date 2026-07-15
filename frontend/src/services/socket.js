import { io } from "socket.io-client";
import { getAdminToken, getDeliveryToken, getToken } from "./api";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

let socket = null;

export const initSocket = () => {
  if (socket) return socket;

  const token = getDeliveryToken() || getAdminToken() || getToken();
  socket = io(SOCKET_URL, {
    auth: { token },
    query: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected to server:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected from server");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) return initSocket();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
