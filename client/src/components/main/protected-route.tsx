import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { socketActions } from "@/store/middlewares/socket-middleware";

import MainSpinner from "./main-spinner";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch({ type: socketActions.connect });
    // return () => {
    //   dispatch({ type: socketActions.disconnect });
    // };
  }, [dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return <MainSpinner />;
  }

  return <Outlet />;
};
