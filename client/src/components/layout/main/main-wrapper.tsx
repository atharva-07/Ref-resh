import { useQuery } from "@apollo/client";

import PostWriter from "@/components/main/post/new-post-card";
import Post, { PostProps } from "@/components/main/post/post";
import { GET_POSTS } from "@/gql-calls/queries";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { authActions, isAuthenticated } from "@/store/auth-slice";
import { transformTimestamps } from "@/utility/utility-functions";

const MainWrapper = () => {
  const { data, error, loading } = useQuery(GET_POSTS);

  // This is working.
  // const isAuth = useAppSelector(isAuthenticated);
  // const dispatch = useAppDispatch();

  return (
    <main className="border border-border border-t-0 border-b-0 w-[600px]">
      <PostWriter />
      {data && data.loadFeed.length > 0 ? (
        data.loadFeed.map((element: PostProps) => {
          const timestamps = transformTimestamps(
            element.createdAt,
            element.updatedAt
          );
          return <Post key={element._id} {...element} {...timestamps} />;
        })
      ) : (
        <div className="m-4 text-center">
          <h1>Wow, so empty. O_O</h1>
          <p>Follow a bunch of your buddies to see what they are posting.</p>
        </div>
      )}
      {/* <ul>
        
      </ul> */}
    </main>
  );
};

export default MainWrapper;
