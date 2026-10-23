import React, { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext<Socket | null>(null);

// one shared connection for the whole app, open only while logged in
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    // the login cookie is sent with the connection request for auth
    const newSocket = io("http://localhost:3000", { withCredentials: true });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [auth.isAuthenticated, auth.userId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

// null while logged out or before the connection is created
export function useSocket() {
  return useContext(SocketContext);
}
