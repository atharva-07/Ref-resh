import { GET_STORIES_ARCHIVE } from "@/gql-calls/queries";
import { STORY_GRID_PAGE_SIZE } from "@/utility/constants";

import StoryLoader from "../story/story-loader";

const fallbackHeading: string = "No Stories! :(";
const fallbackContent: string = "You have not posted any stories yet.";

const StoryGrid = () => {
  return (
    <StoryLoader
      query={GET_STORIES_ARCHIVE}
      variables={{}}
      pageSize={STORY_GRID_PAGE_SIZE}
      fallbackHeading={fallbackHeading}
      fallbackContent={fallbackContent}
    />
  );
};

export default StoryGrid;
