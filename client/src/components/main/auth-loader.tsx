import axios from "axios";
import { useEffect } from "react";
import React from "react";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { authActions } from "@/store/auth-slice";

// TODO: This works but we need proper refactoring and have to set up proper routing now as we don't want this to be executed on every mount.
// This fails after logging out.
export const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function fetchAccessToken() {
      try {
        dispatch(authActions.setIsLoading(true));
        const response = await axios.get(
          `${import.meta.env.VITE_OAUTH_SERVER_URI}/auth/me`,
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          const userData = await response.data;
          dispatch(authActions.setIsLoading(false));
          dispatch(authActions.setIsAuthenticated(true));
          dispatch(authActions.setUser(userData));
        } else {
          // Handle cases where the user is not authenticated (no valid token)
          dispatch(authActions.logout());
        }
      } catch (error) {
        console.log(error);
        dispatch(authActions.logout());
      }
    }

    fetchAccessToken();
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }

  return children;
};
