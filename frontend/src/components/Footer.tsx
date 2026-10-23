import { useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FOOTER_SECTIONS = [
  {
    heading: "Wardrobe",
    links: [
      { label: "My Wardrobe", to: "/wardrobe" },
      { label: "Outfits", to: "/outfits" },
      { label: "Create Outfit", to: "/outfits/create-outfit" },
    ],
  },
  {
    heading: "Marketplace",
    links: [
      { label: "Shop Listings", to: "/listings" },
      { label: "Messages", to: "/profile/messages" },
      { label: "Transactions", to: "/profile/transactions" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Favourites", to: "/profile/favourites" },
      { label: "My Outfits", to: "/profile/outfits" },
    ],
  },
];

const GUEST_LINKS = [
  { label: "Login", to: "/login" },
  { label: "Register", to: "/register" },
];

export const Footer = () => {
  const { auth } = useAuth();
  const footerRef = useRef<HTMLElement>(null);

  const scrollToTop = () => {
    footerRef.current
      ?.closest("main")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={footerRef}
      className="mt-auto w-full bg-black px-12 py-10 text-white"
    >
      <div className="flex flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <Link to="/" className="text-2xl font-semibold">
            Wardrobe.io
          </Link>
          <p className="mt-2 text-sm text-gray-400">
            Build your digital wardrobe, showcase your style, and turn your
            closet into a marketplace.
          </p>
        </div>

        {auth.isAuthenticated ? (
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3"
          >
            {FOOTER_SECTIONS.map(({ heading, links }) => (
              <div key={heading}>
                <h2 className="mb-3 text-xs uppercase tracking-wider text-gray-400">
                  {heading}
                </h2>
                <ul className="flex flex-col gap-2">
                  {links.map(({ label, to }) => (
                    <li key={to}>
                      <Link to={to} className="text-sm hover:underline">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        ) : (
          <nav aria-label="Footer">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-gray-400">
              Get Started
            </h2>
            <ul className="flex flex-col gap-2">
              {GUEST_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-2 border-t border-gray-700 pt-6 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} Wardrobe.io. All rights reserved.
        </p>
        <button
          type="button"
          onClick={scrollToTop}
          className="w-fit cursor-pointer hover:text-white hover:underline"
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  );
};
