import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../context/AuthContext";

export const Header = () => {
  const nav = useNavigate();
  const { auth, logout } = useAuth();

  if (auth.loading) return null;

  return (
    <header className="flex items-center justify-between p-4">
      <h1 className="font-bold text-4xl">Wardrobe.io</h1>
      {auth.isAuthenticated ? (
        <button
          onClick={logout}
          className="rounded-full p-3 flex items-center justify-center bg-amber-500 cursor-pointer"
        >
          <PersonIcon />
        </button>
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
