import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/loginFunction";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export const Login = () => {
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { refreshAuth } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      console.log("Logged in!");
      await refreshAuth();
      nav("/wardrobe");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form
        className="flex flex-col gap-4 items-center w-80 shadow-xl p-6 bg-white"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded border border-gray-300 outline-none  w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded border border-gray-300 outline-none  w-full"
        />
        <button
          className="disabled:bg-amber-600 w-full p-2 bg-amber-500 rounded-lg shadow-md font-bold hover:bg-amber-600 hover:cursor-pointer transition-all ease-in-out duration-150 mt-2"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Link to="/register" className="text-sm text-blue-500 hover:underline">
          Don't have an account? Register here.
        </Link>
      </form>
    </div>
  );
};
