import { useNavigate } from "react-router-dom";

type AuthState = {
  userId: number | null;
  loading: boolean;
  isAuthenticated: boolean;
};

export const Header = ({ auth }: { auth: AuthState | undefined }) => {
  const nav = useNavigate();
  return (
    <header className="flex items-center justify-between p-6">
      <h1 className="font-bold text-4xl">Wardrobe.io</h1>
      {auth?.isAuthenticated ? (
        <div>Welcome user!</div>
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
