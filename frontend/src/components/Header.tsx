import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar";

export const Header = () => {
  const nav = useNavigate();
  const { auth, logout } = useAuth();

  if (auth.loading) return null;

  return (
    <header className="flex items-center justify-between p-4">
      <h1 className="font-semibold text-4xl">Wardrobe.io</h1>
      {auth.isAuthenticated ? (
        <div className="flex items-center gap-6">
          <Navbar />
          <button
            onClick={logout}
            className="cursor-pointer text-sm hover:underline"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => nav("/login")}
            className="hover:cursor-pointer hover:underline text-sm"
          >
            Login
          </button>
          <button
            onClick={() => nav("/register")}
            className="hover:cursor-pointer hover:underline text-sm"
          >
            Register
          </button>
        </div>
      )}
    </header>
  );
};
