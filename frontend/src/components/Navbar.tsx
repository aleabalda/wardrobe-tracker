import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav>
      <ul className="flex gap-4">
        <li>
          <Link to={"/wardrobe"} className="underline text-sm">
            Wardrobe
          </Link>
        </li>
        <li>
          <Link to={"/listings"} className="underline text-sm">
            Listings
          </Link>
        </li>
        <li>
          <Link to={"/outfits"} className="underline text-sm">
            Outfits
          </Link>
        </li>
        <li>
          <Link to={"/profile/favourites"} className="underline text-sm">
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
};
