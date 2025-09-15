import { Suspense } from "react";

import PostLoader from "@/components/main/post/post-loader";
import { GET_USER_BOOKMARKS } from "@/gql-calls/queries";
import { FEED_PAGE_SIZE } from "@/utility/constants";

const fallbackHeading: string = "Nothing worth bookmarking? :(";
const fallbackContent: string = "You have not bookmarked any post.";

const Bookmarks = () => {
  {
    /* This outer Suspense is needed to get rid of startTransition error.
    Uncomment this Suspense to check the error.*/
  }
  return (
    <main className="w-4/5 *:w-4/5 *:mx-auto *:border">
      <Suspense>
        <PostLoader
          query={GET_USER_BOOKMARKS}
          variables={{}}
          pageSize={FEED_PAGE_SIZE}
          fallbackHeading={fallbackHeading}
          fallbackContent={fallbackContent}
        />
      </Suspense>
    </main>
  );
};

export default Bookmarks;
