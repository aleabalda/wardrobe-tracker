import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar";

export const Header = () => {
  const nav = useNavigate();
  const { auth, logout } = useAuth();

  if (auth.loading) return null;

  return (
    <header className="flex items-center justify-between p-4">
      <h1 className="font-bold text-4xl">Wardrobe.io</h1>
      {auth.isAuthenticated ? (
        <div className="flex items-center gap-6">
          <Navbar />
          <button
            onClick={logout}
            className="rounded py-2 px-4 bg-amber-300 hover:bg-amber-400 transition-all ease-in-out font-semibold cursor-pointer"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => nav("/login")}
            className="bg-amber-400 px-4 py-2 rounded hover:bg-amber-500 hover:cursor-pointer transition-all ease-in-out font-bold hover:shadow-md hover:shadow-gray-200"
          >
            Login
          </button>
          <button
            onClick={() => nav("/register")}
            className="bg-amber-400 px-4 py-2 rounded hover:bg-amber-500 hover:cursor-pointer transition-all ease-in-out font-bold hover:shadow-md hover:shadow-gray-200"
          >
            Create Account
          </button>
        </div>
      )}
    </header>
  );
};
