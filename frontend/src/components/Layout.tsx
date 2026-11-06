import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = () => {
  const { auth } = useAuth();

  // the header scrolls with the page, so --header-height (see Header) lets
  // full-height pages fill the space below it using the h-page utility
  return (
    <main
      className={`h-dvh overflow-y-auto flex flex-col *:shrink-0 ${
        auth.isAuthenticated ? "[--header-height:8.25rem]" : "[--header-height:5rem]"
      }`}
    >
      <Header />
      <Outlet />
      <Footer />
    </main>
  );
};
