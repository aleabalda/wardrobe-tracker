import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { useCallback, useEffect, useState } from "react";
import { logout } from "../api/logoutFunction";

export const Layout = () => {
  type AuthState = {
    userId: number | null;
    loading: boolean;
    isAuthenticated: boolean;
  };

  const [auth, setAuth] = useState<AuthState>({
    userId: null,
    loading: true,
    isAuthenticated: false,
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setAuth({ userId: null, isAuthenticated: false, loading: false });
    }
  };

  const refreshAuth = useCallback(async () => {
    setAuth((prev) => ({ ...prev, loading: true }));

    try {
      const res = await fetch("http://localhost:3000/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setAuth({ userId: null, isAuthenticated: false, loading: false });
        return;
      }

      const data = await res.json();

      if (data.authenticated) {
        setAuth({ userId: data.userId, isAuthenticated: true, loading: false });
      } else {
        setAuth({ userId: null, isAuthenticated: false, loading: false });
      }
    } catch {
      // network error, backend down, etc.
      setAuth({ userId: null, isAuthenticated: false, loading: false });
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
