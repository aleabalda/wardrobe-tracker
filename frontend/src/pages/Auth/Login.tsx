import { Link, useNavigate } from "react-router-dom";

export const Login = () => {
  const nav = useNavigate();
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    nav("/");
    // Handle login logic here
  };
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form className="flex flex-col gap-4 items-center w-80 shadow-xl p-6 bg-white">
        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded border border-gray-300 outline-none  w-full"
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 rounded border border-gray-300 outline-none  w-full"
        />
        <button
          className="w-full p-2 bg-amber-500 rounded-lg shadow-md font-bold hover:bg-amber-600 hover:cursor-pointer transition-all ease-in-out duration-150 mt-2"
          type="submit"
          onClick={handleSubmit}
        >
          Login
        </button>
        <Link to="/register" className="text-sm text-blue-500 hover:underline">
          Don't have an account? Register here.
        </Link>
      </form>
    </div>
  );
};
