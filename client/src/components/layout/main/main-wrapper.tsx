import { useQuery } from "@apollo/client";

import Post, { PostProps } from "@/components/main/post";
import PostWriter from "@/components/ui/post-writer";
import { GET_POSTS } from "@/gql-calls/queries";
import { useAppSelector } from "@/hooks/useAppSelector";
import { transformTimestamps } from "@/utility/utility-functions";

const MainWrapper = () => {
  const { data, error, loading } = useQuery(GET_POSTS);
  const auth = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <main className="border border-slate-700 border-t-0 border-b-0 w-[600px]">
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
