import { useCallback, useEffect, useState } from "react";
import { fetchUnreadCount } from "../api/conversations";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

/** How many unread messages the logged-in user has, kept up to date live. */
export const useUnreadCount = () => {
  const { auth } = useAuth();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      setUnreadCount(await fetchUnreadCount());
    } catch (error) {
      console.error("Unable to load unread count:", error);
    }
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    void loadUnreadCount();

    return () => {
      setUnreadCount(0);
    };
  }, [auth.isAuthenticated, auth.userId, loadUnreadCount]);

  // new messages raise the count, reading a conversation lowers it, and
  // reconnecting catches up on anything missed while the connection was down
  useEffect(() => {
    if (!socket) return;

    const refresh = () => {
      void loadUnreadCount();
    };

    socket.on("message:new", refresh);
    socket.on("conversation:read", refresh);
    socket.io.on("reconnect", refresh);

    return () => {
      socket.off("message:new", refresh);
      socket.off("conversation:read", refresh);
      socket.io.off("reconnect", refresh);
    };
  }, [socket, loadUnreadCount]);

  return unreadCount;
};
