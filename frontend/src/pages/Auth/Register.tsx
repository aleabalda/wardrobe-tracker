import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { register } from "../../api/registerFunction";

export const Register = () => {
  const nav = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
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
          id="first-name"
          name="first-name"
          type="text"
          placeholder="First Name"
          className="p-2 rounded border border-gray-300 outline-none  w-full"
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          id="last-name"
          name="last-name"
          type="text"
          placeholder="Last Name"
          className="p-2 rounded border border-gray-300 outline-none  w-full"
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Username"
          required
          className="p-2 rounded border border-gray-300 outline-none  w-full"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          required
          className="p-2 rounded border border-gray-300 outline-none  w-full"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="Phone Number"
          onChange={(e) => setPhoneNumber(e.target.value)}
          pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
          className="p-2 rounded border border-gray-300 outline-none  w-full"
        />
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          required
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
