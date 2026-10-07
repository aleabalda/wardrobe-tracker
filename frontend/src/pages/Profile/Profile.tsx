import { NavLink, Outlet } from "react-router-dom";
import { MyDetails } from "./MyDetails";

export const Profile = () => {
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `font-semibold cursor-pointer hover:underline ${
      isActive ? "underline" : ""
    }`;

  return (
    <div className="h-full p-12 flex flex-col gap-2">
      <h2 className="text-4xl font-semibold mb-2">Profile</h2>
      <nav>
        <ul className="flex gap-4">
          <li>
            <NavLink to="/profile/favourites" className={linkStyle}>
              My Favourites
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile/outfits" className={linkStyle}>
              My Outfits
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile/transactions" className={linkStyle}>
              My Transactions
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="w-full h-0.5 rounded bg-black" />

      <div className="mt-4 flex flex-1 min-h-0">
        <div className="h-full">
          <MyDetails />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
