import "./styles/global.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "./context/theme";
import Bookmarks from "./routes/Bookmarks";
import Conversations from "./routes/Conversations";
import Error from "./routes/Error";
import HomePage from "./routes/Home";
import Login from "./routes/Login";
import Notifications from "./routes/Notifications";
import RootLayout from "./routes/RootLayout";
import Signup from "./routes/Signup";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/notifications", element: <Notifications /> },
      { path: "/conversations", element: <Conversations /> },
      { path: "/bookmarks", element: <Bookmarks /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
