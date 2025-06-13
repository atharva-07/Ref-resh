import "./styles/global.css";

import axios from "axios";
import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "./components/layout/layout";
import { AuthLoader } from "./components/main/auth-loader";
import ChatWindow from "./components/main/chat/chat-window";
import { ProtectedRoute } from "./components/main/protected-route";
import { PublicRoute } from "./components/main/public-route";
import { ThemeProvider } from "./context/theme";
import { useAppDispatch } from "./hooks/useAppDispatch";
import { useAppSelector } from "./hooks/useAppSelector";
import Bookmarks from "./routes/Bookmarks";
import Conversations from "./routes/Conversations";
import Error from "./routes/Error";
import HomePage from "./routes/Home";
import Login from "./routes/Login";
import Notifications from "./routes/Notifications";
import Profile from "./routes/Profile";
import RootLayout from "./routes/RootLayout";
import Signup from "./routes/Signup";
import { authActions } from "./store/auth-slice";

// TODO: Not working perfectly, need to check the logic.
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "notifications", element: <Notifications /> },
          {
            path: "conversations",
            element: <Conversations />,
            children: [
              {
                path: ":chatId",
                element: <ChatWindow />,
              },
            ],
          },
          { path: "bookmarks", element: <Bookmarks /> },
          { path: ":username", element: <Profile /> },
        ],
      },
      {
        element: <PublicRoute />,
        children: [
          { path: "login", element: <Login /> },
          { path: "signup", element: <Signup /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <AuthLoader>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthLoader>
  );
}

export default App;
