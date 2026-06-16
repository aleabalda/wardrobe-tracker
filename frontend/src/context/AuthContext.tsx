import React, { createContext, useContext, useEffect, useState } from "react";

type AuthState = {
  userId: number | null;
  loading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = {
  auth: AuthState;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setAuthed: (userId: number) => void; // convenience after login
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    userId: null,
    loading: true,
    isAuthenticated: false,
  });

  const refreshAuth = async () => {
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
      setAuth({ userId: null, isAuthenticated: false, loading: false });
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setAuth({ userId: null, isAuthenticated: false, loading: false });
    }
  };

  // convenience: after login/register succeeds
  const setAuthed = (userId: number) => {
    setAuth({ userId, isAuthenticated: true, loading: false });
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, refreshAuth, logout, setAuthed }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
