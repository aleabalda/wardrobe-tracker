import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav>
      <ul className="flex gap-4">
        <li>
          <Link to={"/wardrobe"} className="hover:underline font-semibold">
            Wardrobe
          </Link>
        </li>
        <li>
          <Link to={"/listings"} className="hover:underline font-semibold">
            Listings
          </Link>
        </li>
        <li>
          <Link
            to={"/profile/favourites"}
            className="hover:underline font-semibold"
          >
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
};
