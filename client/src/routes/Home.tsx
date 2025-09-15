import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import NewPostCard from "@/components/main/post/new-post-card";
import PostFeed from "@/components/main/post/post-feed";
import PostWriterModal from "@/components/modal/post-writer-modal";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { socketActions } from "@/store/middlewares/socket-middleware";

const HomePage = () => {
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   dispatch({ type: socketActions.connect });
  //   console.log("Dispatched socketActions.connect");

  //   // return () => {
  //   //   dispatch({ type: socketActions.disconnect });
  //   //   console.log("Dispatched socketActions.disconnect");
  //   // };
  // }, [dispatch]);

  return (
    <main className="w-4/5 *:w-4/5 *:mx-auto *:border">
      <PostWriterModal>
        <NewPostCard />
      </PostWriterModal>
      <PostFeed />
    </main>
  );
};

export default HomePage;
