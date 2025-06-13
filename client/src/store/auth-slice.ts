import { CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { createAppSlice } from "./createAppSlice";

interface UserState {
  userId: string;
  fullName: string;
  username: string;
  pfpPath: string;
}

interface AuthState {
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserState | null;
}

const initialState: AuthState = {
  error: null,
  isAuthenticated: false,
  isLoading: false,
  user: null,
};

const setIsAuthenticated: CaseReducer<AuthState, PayloadAction<boolean>> = (
  state,
  action
) => {
  state.isAuthenticated = action.payload;
};

const setIsLoading: CaseReducer<AuthState, PayloadAction<boolean>> = (
  state,
  action
) => {
  state.isLoading = action.payload;
};

const setUser: CaseReducer<AuthState, PayloadAction<UserState | null>> = (
  state,
  action
) => {
  state.user = action.payload;
};

const logout: CaseReducer<AuthState> = (state) => {
  state.isAuthenticated = false;
  state.error = null;
  state.user = null;
  state.isLoading = false;
};

const setError: CaseReducer<AuthState, PayloadAction<string | null>> = (
  state,
  action
) => {
  state.error = action.payload;
};

const clearError: CaseReducer<AuthState> = (state) => {
  state.error = null;
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const authSlice = createAppSlice({
  name: "auth",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    clearError,
    logout,
    setIsLoading,
    setIsAuthenticated,
    setUser,
    setError,
  },
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    isAuthenticated: (auth) => auth.isAuthenticated,
    user: (auth) => auth.user,
    error: (auth) => auth.error,
    isLoading: (auth) => auth.isLoading,
  },
});

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { isAuthenticated, user, error, isLoading } = authSlice.selectors;
export const authActions = authSlice.actions;
