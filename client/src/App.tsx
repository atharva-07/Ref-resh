import "./styles/global.css";

import {
  createBrowserRouter,
  RouterProvider,
  useParams,
} from "react-router-dom";

import Layout from "./components/layout/layout";
import { AuthLoader } from "./components/main/auth-loader";
import ChatWindow from "./components/main/chat/chat-window";
import CommentViewerWrapper from "./components/main/comment/comment-viewer";
import ImageViewer from "./components/main/post/image-viewer";
import PostViewer from "./components/main/post/post-viewer";
import LikedPosts from "./components/main/profile/liked-posts";
import StoryGrid from "./components/main/profile/story-grid";
import UserPosts from "./components/main/profile/user-posts";
import { ProtectedRoute } from "./components/main/protected-route";
import { PublicRoute } from "./components/main/public-route";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./context/theme";
import Bookmarks from "./routes/Bookmarks";
import Conversations from "./routes/Conversations";
import Error from "./routes/Error";
import HomePage from "./routes/Home";
import Login from "./routes/Login";
import Notifications from "./routes/Notifications";
import Profile from "./routes/Profile";
import Signup from "./routes/Signup";

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
          {
            path: "post/:postId",
            element: <PostViewer />,
            children: [
              {
                path: "photos",
                element: <ImageViewer />,
              },
            ],
          },
          {
            path: "comment/:commentId",
            element: <CommentViewerWrapper />,
          },
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
          {
            path: ":username",
            element: <Profile />,
            children: [
              {
                index: true,
                element: <UserPosts />,
              },
              {
                path: "likes",
                element: <LikedPosts />,
              },
              {
                path: "stories",
                element: <StoryGrid />,
              },
            ],
          },
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
        <Toaster />
      </ThemeProvider>
    </AuthLoader>
  );
}

export default App;
