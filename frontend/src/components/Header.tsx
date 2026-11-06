import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { Navbar } from "./Navbar";

const titleLink = (
  <h1 className="font-title text-6xl uppercase">
    <Link to="/">Wardrobe Tracker</Link>
  </h1>
);

// Row heights add up to --header-height in Layout: the title row (5.25rem) + h-12
// when logged in, h-20 for guests
export const Header = () => {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { auth, logout } = useAuth();
  const unreadCount = useUnreadCount();
  const titleRowRef = useRef<HTMLElement>(null);
  const [isTitleHidden, setIsTitleHidden] = useState<boolean>(false);

  // once the title row has scrolled out of <main>, only the stuck rows are left
  useEffect(() => {
    const titleRow = titleRowRef.current;
    if (!titleRow) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTitleHidden(!entry.isIntersecting);
      },
      { root: titleRow.closest("main") },
    );
    observer.observe(titleRow);

    return () => {
      observer.disconnect();
    };
  }, [auth.loading, auth.isAuthenticated]);

  if (auth.loading) return null;

  if (!auth.isAuthenticated) {
    return (
      <header className="sticky top-0 z-10 flex h-20 items-center justify-between bg-white px-12 text-black">
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
  const isMessagesActive =
    pathname === "/messages" || pathname.startsWith("/messages/");

  // these are separate elements, not wrapped in one, so each can stick or scroll
  // on its own. The account links take up no space (h-12 and -mb-12 cancel out)
  // and stay in the top right corner, above the links bar once it reaches them
  return (
    <>
      <div
        className={`sticky top-0 z-10 -mb-12 flex h-12 w-fit items-center gap-4 self-end px-12 text-sm transition-colors duration-200 ${
          isTitleHidden ? "text-white" : "text-black"
        }`}
      >
        <Link
          to="/messages"
          aria-current={isMessagesActive ? "page" : undefined}
          className={isMessagesActive ? "underline" : "hover:underline"}
        >
          Messages
          {unreadCount > 0 && (
            <span aria-label={`${unreadCount} unread`}>
              {" "}
              ({unreadCount > 99 ? "99+" : unreadCount})
            </span>
          )}
        </Link>
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
      <header
        ref={titleRowRef}
        className="flex items-center bg-white py-3 pl-12 pr-88 text-black"
      >
        {titleLink}
      </header>
      <div
        className={`sticky top-0 z-9 flex h-12 items-center pl-12 pr-88 transition-colors duration-200 ${
          isTitleHidden ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <Navbar />
      </div>
    </>
  );
};
