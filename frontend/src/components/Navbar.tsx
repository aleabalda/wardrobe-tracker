import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav>
      <ul className="flex gap-4">
        <li>
          <Link to={"/wardrobe"} className="hover:underline">
            Wardrobe
          </Link>
        </li>
        <li>
          <Link to={"/listings"} className="hover:underline">
            Listings
          </Link>
        </li>
        <li>
          <Link to={"/profile"} className="hover:underline">
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
};
