import { useQuery, useSuspenseQuery } from "@apollo/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import NewPostCard from "@/components/main/post/new-post-card";
import Feed from "@/components/main/post/post-feed";
import PostWriterModal from "@/components/modal/post-writer-modal";

const MainWrapper = () => {
  return (
    <main className="w-3/4 *:w-3/4 *:mx-auto ">
      <PostWriterModal>
        <NewPostCard />
      </PostWriterModal>
      <ErrorBoundary fallback={<h2>Failed to fetch posts.</h2>}>
        <Suspense fallback={<h2>Fetching posts....</h2>}>
          <Feed />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
};

export default MainWrapper;
