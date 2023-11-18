import "./styles/global.css";
import { ThemeProvider } from "./context/theme";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./routes/RootLayout";
import HomePage from "./routes/Home";
import Notifications from "./routes/Notifications";
import Conversations from "./routes/Conversations";
import Bookmarks from "./routes/Bookmarks";
import Error from "./routes/Error";
import Login from "./routes/Login";
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
