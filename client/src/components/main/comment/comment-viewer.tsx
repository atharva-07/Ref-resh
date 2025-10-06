import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";

import CommentComposer from "@/components/forms/composer/comment-composer";

import MainSpinner from "../main-spinner";
import CommentLoader from "./comment-loader";
import CommentsChain from "./comments-chain";

const CommentViewer = ({ key }: { key: string }) => {
  return (
    <ErrorBoundary fallback={<h2>Failed to load the comments.</h2>}>
      <Suspense fallback={<MainSpinner message="Loading comments..." />}>
        <main className="w-4/5 *:w-4/5 *:mx-auto *:border border-t-0">
          <CommentsChain />
          <CommentLoader />
        </main>
      </Suspense>
    </ErrorBoundary>
  );
};

const CommentViewerWrapper = () => {
  const params = useParams();
  const commentId = params.commentId as string;

  return <CommentViewer key={commentId} />;
};

export default CommentViewerWrapper;
