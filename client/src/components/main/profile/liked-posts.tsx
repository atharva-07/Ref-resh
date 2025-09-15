import { GET_USER_LIKES } from "@/gql-calls/queries";
import { FEED_PAGE_SIZE } from "@/utility/constants";

import PostLoader from "../post/post-loader";

const fallbackHeading: string = "Supreme taste, huh?";
const fallbackContent: string = "You have not liked any post yet.";

const LikedPosts = () => {
  return (
    <PostLoader
      query={GET_USER_LIKES}
      variables={{}}
      pageSize={FEED_PAGE_SIZE}
      fallbackHeading={fallbackHeading}
      fallbackContent={fallbackContent}
    />
  );
};

export default LikedPosts;
