import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import useMe from "@/hooks/useMe";
import { socketActions } from "@/store/middlewares/socket-middleware";
import { sseActions } from "@/store/middlewares/sse-middleware";

import MainSpinner from "./main-spinner";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth
  );
  const location = useLocation();

  const dispatch = useAppDispatch();

  const { isUsernameSetupComplete, loading } = useMe();

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      dispatch({ type: socketActions.connect });
      dispatch({ type: sseActions.connect, payload: user?.userId });
    }
    // return () => {
    //   dispatch({ type: socketActions.disconnect });
    //   dispatch({ type: sseActions.disconnect });
    // };
  }, [dispatch, user, user?.userId, isAuthenticated]);

  if (isLoading || loading) return <MainSpinner />;

  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (location.pathname === "/setup" && isUsernameSetupComplete)
    return <Navigate to="/" replace />;

  if (location.pathname === "/setup") return <Outlet />;

  if (isAuthenticated && !isUsernameSetupComplete)
    return <Navigate to="/setup" state={{ from: location }} replace />;

  return <Outlet />;
};
