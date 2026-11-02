import { useAuth } from "../../context/AuthContext";

/** Where a CTA should send the visitor: the real page if logged in, otherwise sign-up. */
export const useCtaTarget = (authedPath: string) => {
  const { auth } = useAuth();
  return auth.isAuthenticated ? authedPath : "/register";
};
