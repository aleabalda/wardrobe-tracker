import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { register } from "../../api/registerFunction";
import { SubmitButton, TextField } from "../../components/ui/FormField";

export const Register = () => {
  const nav = useNavigate();
  // passed on so logging in afterwards still returns to the original page
  const { state } = useLocation();
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
      await register({
        firstName,
        lastName,
        phoneNumber,
        email,
        username,
        password,
      });
      console.log("Registered!");
      setLoading(false);
      nav("/login", { state });
      // redirect to login or auto-login
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white p-4">
      <form className="flex w-full max-w-md flex-col gap-3">
        <h1 className="mb-2 text-base">Create Account</h1>
        <TextField
          label="First Name"
          name="first-name"
          type="text"
          optional
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          label="Last Name"
          name="last-name"
          type="text"
          optional
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          label="Username"
          name="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Phone Number"
          name="phone"
          type="tel"
          optional
          pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <SubmitButton onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </SubmitButton>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Link to="/login" state={state} className="w-fit text-sm underline">
          Already have an account? Login here.
        </Link>
      </form>
    </div>
  );
};
