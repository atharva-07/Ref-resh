import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  user?: {
    userId: string;
    fullName: string;
    username: string;
    pfpPath: string;
  };
}

const initialAuthenticationState: AuthState = {
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthenticationState,
  reducers: {
    login(state) {
      state.isAuthenticated = true;
      state.user = {
        userId: "",
        fullName: "Atharva Wankhede",
        username: "@atharva07",
        pfpPath: "",
      };
    },
    logout(state) {
      state.isAuthenticated = false;
    },
  },
});

export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;
