import { Navigate, Outlet, useNavigate } from "react-router-dom";

import { useAppSelector } from "@/hooks/useAppSelector";

export const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
