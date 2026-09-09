import { NavLink, Outlet } from "react-router-dom";

export const Profile = () => {
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `font-semibold cursor-pointer hover:underline ${
      isActive ? "underline" : ""
    }`;

  return (
    <div className="p-12 flex flex-col gap-2">
      <div className="font-semibold cursor-default">Profile</div>
      <div className="w-full h-0.5 rounded bg-black" />
      <nav>
        <ul className="flex gap-4">
          <li>
            <NavLink to="/profile" end className={linkStyle}>
              My Details
            </NavLink>
          </li>
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
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
};
