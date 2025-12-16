import "./styles/global.css";

import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
import { AudioCallDialog } from "./components/modal/audio-call-modal";
import IncomingCallDialog from "./components/modal/incoming-call-modal";
import UserSetupModal from "./components/modal/user-setup-modal";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./context/theme";
import { useCallWarning } from "./hooks/useCallWarning";
import Bookmarks from "./routes/Bookmarks";
import Calls from "./routes/Calls";
import Conversations from "./routes/Conversations";
import Error from "./routes/Error";
import ForogtPassword from "./routes/ForgotPassword";
import HomePage from "./routes/Home";
import Login from "./routes/Login";
import Notifications from "./routes/Notifications";
import Profile from "./routes/Profile";
import Requests from "./routes/Requests";
import ResetPassword from "./routes/ResetPassword";
import Settings from "./routes/Settings";
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
          {
            path: "calls",
            element: <Calls />,
          },
          { path: "bookmarks", element: <Bookmarks /> },
          {
            path: "requests",
            element: (
              // This is very hacky but let's just keep this for now.
              <Suspense>
                <Requests />
              </Suspense>
            ),
          },
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
          {
            path: "settings",
            element: (
              // Hacky solution. :)
              <Suspense>
                <Settings />
              </Suspense>
            ),
          },
          {
            path: "setup",
            element: <UserSetupModal />,
          },
        ],
      },
      {
        element: <PublicRoute />,
        children: [
          { path: "login", element: <Login /> },
          { path: "signup", element: <Signup /> },
          { path: "forgot-password", element: <ForogtPassword /> },
          { path: "reset-password", element: <ResetPassword /> },
        ],
      },
    ],
  },
]);

function App() {
  useCallWarning();

  return (
    <AuthLoader>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <RouterProvider router={router} />
        <Toaster />
        <IncomingCallDialog />
        <AudioCallDialog />
      </ThemeProvider>
    </AuthLoader>
  );
}

export default App;
