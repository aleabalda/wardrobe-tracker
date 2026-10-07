import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export const Layout = () => {
  return (
    <div className="h-dvh flex flex-col">
      <Header />
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
};
