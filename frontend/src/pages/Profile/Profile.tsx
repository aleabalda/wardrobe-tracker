import { NavLink, Outlet } from "react-router-dom";
import { MyDetails } from "./MyDetails";

export const Profile = () => {
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `text-sm cursor-pointer hover:underline ${isActive ? "underline" : ""}`;

  return (
    <div className="h-page px-12 pt-10 flex flex-col gap-2">
      <h2 className="text-xl font-semibold mb-2">Profile</h2>
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
      <div className="w-full h-px rounded bg-black" />

      <div className="py-4 flex flex-1 min-h-0">
        <div className="h-full">
          <MyDetails />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
