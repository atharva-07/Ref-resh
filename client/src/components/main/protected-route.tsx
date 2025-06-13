import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "@/hooks/useAppSelector";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
