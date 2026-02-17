import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { useEffect, useState } from "react";

export const Layout = () => {
  type AuthState = {
    userId: number | null;
    loading: boolean;
    isAuthenticated: boolean;
  };

  const [auth, setAuth] = useState<AuthState>();

  useEffect(() => {
    fetch("http://localhost:3000/api/auth/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          console.log("User is authenticated:", data);
          setAuth({
            userId: data.userId,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          setAuth({
            userId: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      });
  }, []);
  return (
    <div>
      <Header auth={auth}></Header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
