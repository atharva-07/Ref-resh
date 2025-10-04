import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { socketActions } from "@/store/middlewares/socket-middleware";
import { sseActions } from "@/store/middlewares/sse-middleware";

import MainSpinner from "./main-spinner";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth
  );
  const location = useLocation();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch({ type: socketActions.connect });
    dispatch({ type: sseActions.connect, payload: user?.userId });
    // return () => {
    //  dispatch({ type: socketActions.disconnect });
    //  dispatch({type: sseActions.disconnect});
    // };
  }, [dispatch, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return <MainSpinner />;
  }

  return <Outlet />;
};
