import { useParams } from "react-router-dom";

import { GET_USER_POSTS } from "@/gql-calls/queries";
import { FEED_PAGE_SIZE } from "@/utility/constants";

import PostLoader from "../post/post-loader";

const fallbackHeading: string = "Mysterious? Non-chalant? or Batman?";
const fallbackContent: string = "You have not posted anything yet.";

const UserPosts = () => {
  const params = useParams();
  const username = params.username as string;

  return (
    <PostLoader
      query={GET_USER_POSTS}
      variables={{
        userName: username,
      }}
      pageSize={FEED_PAGE_SIZE}
      fallbackHeading={fallbackHeading}
      fallbackContent={fallbackContent}
    />
  );
};

export default UserPosts;
