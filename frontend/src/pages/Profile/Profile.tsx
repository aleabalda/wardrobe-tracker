import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { fetchUnreadCount } from "../../api/conversations";
import { useSocket } from "../../context/SocketContext";
import { MyDetails } from "./MyDetails";

export const Profile = () => {
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      setUnreadCount(await fetchUnreadCount());
    } catch (error) {
      console.error("Unable to load unread count:", error);
    }
  }, []);

  useEffect(() => {
    void loadUnreadCount();
  }, [loadUnreadCount]);

  // new messages raise the count, reading a conversation lowers it, and
  // reconnecting catches up on anything missed while the connection was down
  useEffect(() => {
    if (!socket) return;

    const refresh = () => {
      void loadUnreadCount();
    };

    socket.on("message:new", refresh);
    socket.on("conversation:read", refresh);
    socket.io.on("reconnect", refresh);

    return () => {
      socket.off("message:new", refresh);
      socket.off("conversation:read", refresh);
      socket.io.off("reconnect", refresh);
    };
  }, [socket, loadUnreadCount]);

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `text-sm cursor-pointer hover:underline ${isActive ? "underline" : ""}`;

  return (
    <div className="h-full px-12 pt-10 flex flex-col gap-2">
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
          <li>
            <NavLink
              to="/profile/messages"
              className={(state) =>
                `${linkStyle(state)} inline-flex items-center gap-0.5`
              }
            >
              My Messages
              {unreadCount > 0 && (
                <span aria-label={`${unreadCount} unread`} className="text-sm">
                  ({unreadCount > 99 ? "99+" : unreadCount})
                </span>
              )}
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
