import { Link, useLocation } from "react-router-dom";

// `section` is the base path that marks the link as active, so e.g. Wardrobe
// stays underlined on every /wardrobe/* page, not just /wardrobe
const NAV_LINKS = [
  { label: "Wardrobe", to: "/wardrobe", section: "/wardrobe" },
  { label: "Listings", to: "/listings", section: "/listings" },
  { label: "Outfits", to: "/outfits", section: "/outfits" },
];

export const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav>
      <ul className="flex gap-4">
        {NAV_LINKS.map(({ label, to, section }) => {
          const isActive =
            pathname === section || pathname.startsWith(`${section}/`);

          return (
            <li key={label} className="text-sm">
              <Link
                to={to}
                aria-current={isActive ? "page" : undefined}
                className={`${isActive ? "underline" : "hover:underline"}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
