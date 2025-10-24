import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAppSelector } from "@/hooks/useAppSelector";

import MainSpinner from "./main-spinner";

export const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (isLoading) return <MainSpinner />;

  if (isAuthenticated) return <Navigate to={from} replace />;

  return <Outlet />;
};
