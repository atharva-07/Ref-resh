import { useQuery, useSuspenseQuery } from "@apollo/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import Feed from "@/components/main/post/feed";
import NewPostCard from "@/components/main/post/new-post-card";
import PostWriterModal from "@/components/modal/post-writer-modal";

const MainWrapper = () => {
  return (
    <main className="border border-border border-t-0 border-b-0 w-[600px]">
      <PostWriterModal>
        <NewPostCard />
      </PostWriterModal>
      <ErrorBoundary fallback={<h2>Failed to fetch posts....</h2>}>
        <Suspense fallback={<h2>Fetching posts....</h2>}>
          <Feed />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
};

export default MainWrapper;
