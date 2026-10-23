import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = () => {
  return (
    <div className="h-dvh flex flex-col">
      <Header />
      <main className="flex-1 min-h-0 overflow-y-auto flex flex-col *:shrink-0">
        <Outlet />
        <Footer />
      </main>
    </div>
  );
};
