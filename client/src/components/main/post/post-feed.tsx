import { useSuspenseQuery } from "@apollo/client";
import { Divide, Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { GET_FEED } from "@/gql-calls/queries";
import { FEED_PAGE_SIZE } from "@/utility/constants";
import { transformTimestamps } from "@/utility/utility-functions";

import Post, { PostProps } from "./post";
import PostLoader from "./post-loader";

const fallbackHeading: string = "Wow, so empty. O_O";
const fallbackContent: string =
  "Follow a bunch of your buddies to see what they are posting.";

const PostFeed = () => {
  /* This outer Suspense is needed to get rid of startTransition error.
    Uncomment this Suspense to check the error.*/

  return (
    <Suspense>
      <PostLoader
        query={GET_FEED}
        variables={{}}
        pageSize={FEED_PAGE_SIZE}
        fallbackHeading={fallbackHeading}
        fallbackContent={fallbackContent}
      />
    </Suspense>
  );
};

export default PostFeed;
