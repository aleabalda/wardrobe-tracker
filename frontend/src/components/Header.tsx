import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar";

const titleLink = (
  <h1 className="font-title text-6xl uppercase">
    <Link to="/">Wardrobe Tracker</Link>
  </h1>
);

// Row heights add up to --header-height in Layout: h-20 + h-12 when logged in,
// h-20 for guests
export const Header = () => {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { auth, logout } = useAuth();

  if (auth.loading) return null;

  if (!auth.isAuthenticated) {
    return (
      <header className="sticky top-0 z-10 flex h-20 items-center justify-between bg-black px-12 text-white">
        {titleLink}
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
      </header>
    );
  }

  const isProfileActive =
    pathname === "/profile" || pathname.startsWith("/profile/");

  // these are separate elements, not wrapped in one, so each can stick or scroll
  // on its own. The account links take up no space (h-12 and -mb-12 cancel out)
  // and stay in the top right corner, above the links bar once it reaches them
  return (
    <>
      <div className="sticky top-0 z-10 -mb-12 flex h-12 w-fit items-center gap-6 self-end px-12 text-sm text-white">
        <Link
          to="/profile/favourites"
          aria-current={isProfileActive ? "page" : undefined}
          className={isProfileActive ? "underline" : "hover:underline"}
        >
          Profile
        </Link>
        <button onClick={logout} className="cursor-pointer hover:underline">
          Logout
        </button>
      </div>
      <header className="flex items-center bg-black py-3 pl-12 pr-44 text-white">
        {titleLink}
      </header>
      <div className="sticky top-0 z-9 flex h-12 items-center bg-black pl-12 pr-44 text-white">
        <Navbar />
      </div>
    </>
  );
};
