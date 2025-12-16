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
    // TODO: FIXME: This is causing issues when not commented out. So, commenting out for now. Ideally, this check should be there.
    if (user && !isLoading) {
      dispatch({ type: socketActions.connect });
      dispatch({ type: sseActions.connect, payload: user.userId });
    }
  }, [dispatch, user, isLoading]);

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
