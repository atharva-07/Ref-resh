import { Suspense } from "react";

import CallLoader from "@/components/main/call/call-loader";
import { GET_CALLS_HISTORY } from "@/gql-calls/queries";
import { CALLS_PAGE_SIZE } from "@/utility/constants";

const fallbackHeading: string = "Do you not like talking? O_O";
const fallbackContent: string =
  "You have not talked with anyone in here yet. :(";

const Calls = () => {
  return (
    <main className="w-4/5 *:w-4/5 *:mx-auto *:border">
      <h2 className="p-2">Call History</h2>
      <Suspense>
        <CallLoader
          hero={true}
          query={GET_CALLS_HISTORY}
          variables={{}}
          pageSize={CALLS_PAGE_SIZE}
          fallbackHeading={fallbackHeading}
          fallbackContent={fallbackContent}
        />
      </Suspense>
    </main>
  );
};

export default Calls;
