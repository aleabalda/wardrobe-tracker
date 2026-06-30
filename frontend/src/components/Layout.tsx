import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export const Layout = () => {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="h-full p-4">
        <Outlet />
      </main>
    </div>
  );
};
