import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav>
      <ul className="flex gap-4">
        <li>
          <Link to={"/wardrobe"} className="hover:underline text-sm">
            Wardrobe
          </Link>
        </li>
        <li>
          <Link to={"/listings"} className="hover:underline text-sm">
            Listings
          </Link>
        </li>
        <li>
          <Link to={"/profile/favourites"} className="hover:underline text-sm">
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
};
