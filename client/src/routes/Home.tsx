import PostComposer from "@/components/forms/composer/post-composer";
import PostFeed from "@/components/main/post/post-feed";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { socketActions } from "@/store/middlewares/socket-middleware";

const HomePage = () => {
  // const dispatch = useAppDispatch();

  // useEffect(() => {
  //   dispatch({ type: socketActions.connect });
  //   console.log("Dispatched socketActions.connect");

  //   // return () => {
  //   //   dispatch({ type: socketActions.disconnect });
  //   //   console.log("Dispatched socketActions.disconnect");
  //   // };
  // }, [dispatch]);

  return (
    <main className="w-4/5 *:w-4/5 *:mx-auto *:border">
      <PostComposer />
      <PostFeed />
    </main>
  );
};

export default HomePage;
