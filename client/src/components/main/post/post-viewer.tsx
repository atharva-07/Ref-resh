import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import CommentComposer from "@/components/forms/composer/comment-composer";

import CommentLoader from "../comment/comment-loader";
import MainSpinner from "../main-spinner";
import PostHero from "./post-hero";

const PostViewer = () => {
  return (
    <ErrorBoundary fallback={<h2>Failed to load the post.</h2>}>
      <Suspense fallback={<MainSpinner message="Loading post..." />}>
        <main className="w-4/5 *:w-4/5 *:mx-auto *:border border-t-0">
          <PostHero />
          <CommentComposer />
          <CommentLoader />
        </main>
      </Suspense>
    </ErrorBoundary>
  );
};

export default PostViewer;
