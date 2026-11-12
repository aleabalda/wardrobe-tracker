import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../api/loginFunction";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { SubmitButton, TextField } from "../../components/ui/FormField";

export const Login = () => {
  const nav = useNavigate();
  const location = useLocation();
  // the page they were sent here from (see ProtectedRoute), if any
  const from = (location.state as { from?: string } | null)?.from;
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
      nav(from ?? "/wardrobe", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white p-4">
      <form
        className="flex w-full max-w-md flex-col gap-3"
        onSubmit={handleSubmit}
      >
        <h1 className="mb-2 text-base">Log In</h1>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <SubmitButton disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </SubmitButton>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Link to="/register" state={location.state} className="w-fit text-sm underline">
          Don't have an account? Register here.
        </Link>
      </form>
    </div>
  );
};
