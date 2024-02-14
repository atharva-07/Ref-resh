import { CaseReducer } from "@reduxjs/toolkit";

import { createAppSlice } from "./createAppSlice";

interface AuthState {
  isAuthenticated: boolean;
  user?: {
    userId: string;
    fullName: string;
    username: string;
    pfpPath: string;
  };
}

const initialState: AuthState = {
  isAuthenticated: false,
};

const login: CaseReducer<AuthState> = (state) => {
  state.isAuthenticated = true;
  state.user = {
    userId: "",
    fullName: "Atharva Wankhede",
    username: "@atharva07",
    pfpPath: "",
  };
};

const logout: CaseReducer<AuthState> = (state) => {
  state.isAuthenticated = false;
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const authSlice = createAppSlice({
  name: "auth",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    login,
    logout,
  },
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: { isAuthenticated: (auth) => auth.isAuthenticated },
});

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { isAuthenticated } = authSlice.selectors;
export const authActions = authSlice.actions;
