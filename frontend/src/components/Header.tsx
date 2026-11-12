import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { Navbar } from "./Navbar";
import { APP_NAME, Logo } from "./Logo";

const titleLink = (
  <h1 className="text-6xl">
    <Link to="/" aria-label={`${APP_NAME} home`}>
      <Logo />
    </Link>
  </h1>
);

// Row heights add up to --header-height in Layout: the title row (5.25rem) + h-12
// when logged in, h-20 for guests
export const Header = () => {
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
    return <GuestHeader overHero={pathname === "/"} />;
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
          to="/profile/outfits"
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

// On the landing page the guest header floats over the dark hero (-mb-20 pulls
// the hero up underneath it) and turns into a frosted white bar once scrolled
const GuestHeader = ({ overHero }: { overHero: boolean }) => {
  const headerRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const main = headerRef.current?.closest("main");
    if (!main) return;

    const onScroll = () => setIsScrolled(main.scrollTop > 24);
    onScroll();
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []);

  const isTransparent = overHero && !isScrolled;

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-10 flex h-20 items-center justify-between px-6 transition-colors duration-300 md:px-12 ${
        overHero ? "-mb-20" : ""
      } ${
        isTransparent
          ? "bg-transparent text-white"
          : "border-b border-black/5 bg-white/85 text-black backdrop-blur-md"
      }`}
    >
      <Link
        to="/"
        aria-label={`${APP_NAME} home`}
        className="text-3xl transition-opacity hover:opacity-80"
      >
        <Logo />
      </Link>
      <nav className="flex items-center gap-2 text-sm font-medium">
        <Link
          to="/login"
          className={`rounded-full px-4 py-2 transition-colors ${
            isTransparent ? "hover:bg-white/10" : "hover:bg-black/5"
          }`}
        >
          Log in
        </Link>
        <Link
          to="/register"
          className={`rounded-full px-5 py-2 font-semibold transition-colors ${
            isTransparent
              ? "bg-amber-500 text-black hover:bg-amber-400"
              : "bg-neutral-900 text-white hover:bg-black"
          }`}
        >
          Sign up
        </Link>
      </nav>
    </header>
  );
};
