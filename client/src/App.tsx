import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./styles/global.css";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
  CardFooter,
  CardDescription,
} from "./components/ui/card";
import { ThemeProvider } from "./context/theme";
import { ModeToggle } from "./components/layout/right-sidebar/theme-toggle";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./routes/RootLayout";
import HomePage from "./routes/Home";

// import { useQuery } from "@apollo/client/react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/notifications", element: <h1>Notifications</h1> },
      { path: "/messages", element: <h1>Messages</h1> },
    ],
  },
]);

function App() {
  const [count, setCount] = useState(0);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
