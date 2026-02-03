import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { register } from "../../api/auth/registerFunction";

export const Register = () => {
  const nav = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({ email, username, password });
      console.log("Registered!");
      setLoading(false);
      nav("/login");
      // redirect to login or auto-login
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form className="flex flex-col gap-4 items-center w-80 shadow-xl p-6 bg-white">
        <input
          type="name"
          placeholder="Username"
          className="p-2 rounded border border-gray-300 outline-none  w-full"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded border border-gray-300 outline-none  w-full"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 rounded border border-gray-300 outline-none  w-full"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full p-2 bg-amber-500 rounded-lg shadow-md font-bold hover:bg-amber-600 hover:cursor-pointer transition-all ease-in-out duration-150 mt-2"
          type="submit"
          onClick={handleSubmit}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
        {error && <p>{error}</p>}
        <Link to="/login" className="text-sm text-blue-500 hover:underline">
          Already have an account? Login here.
        </Link>
      </form>
    </div>
  );
};
