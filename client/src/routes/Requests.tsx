import { useMutation, useSuspenseQuery } from "@apollo/client";
import { Check, X } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

import MainSpinner from "@/components/main/main-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ACCEPT_REQUEST,
  FOLLOW_UNFOLLOW_USER,
  REJECT_REQUEST,
} from "@/gql-calls/mutation";
import {
  GET_INCOMING_FOLLOW_REQUESTS,
  GET_SENT_FOLLOW_REQUESTS,
} from "@/gql-calls/queries";

const Requests = () => {
  const { data: incomingRequests } = useSuspenseQuery(
    GET_INCOMING_FOLLOW_REQUESTS
  );
  const { data: sentRequests } = useSuspenseQuery(GET_SENT_FOLLOW_REQUESTS);

  const [acceptRequest] = useMutation(ACCEPT_REQUEST);
  const [rejectRequest] = useMutation(REJECT_REQUEST);
  const [cancelRequest] = useMutation(FOLLOW_UNFOLLOW_USER);

  const handleAccept = async (userId: string, firstname: string) => {
    try {
      const { data } = await acceptRequest({
        variables: {
          userId,
        },
      });
      if (data?.acceptFollowRequest) {
        toast.success("Request Accepted.", {
          description: `You are now following ${firstname}.`,
        });
      }
    } catch (error) {
      toast.error("Could not accept request.", {
        description: "Please try again later.",
      });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const { data } = await rejectRequest({
        variables: {
          userId,
        },
      });
      if (data?.rejectFollowRequest) {
        toast.success("Request Rejected.");
      }
    } catch (error) {
      toast.error("Could not reject request.", {
        description: "Please try again later.",
      });
    }
  };

  const handleCancel = async (userName: string) => {
    try {
      const { data } = await cancelRequest({
        variables: {
          userName,
        },
      });
      if (data?.followOrUnfollowUser) {
        toast.success("Request Removed.");
      }
    } catch (error) {
      toast.error("Could not remove request.", {
        description: "Please try again later.",
      });
    }
  };

  return (
    <Suspense>
      <ErrorBoundary fallback={<h2>Failed to fetch posts.</h2>}>
        <Suspense fallback={<MainSpinner message="Loading user profile..." />}>
          <main className="w-4/5 *:w-4/5 *:mx-auto *:border">
            <div className="flex *:border">
              <div className="flex-1">
                {incomingRequests.fetchIncomingFollowRequests &&
                  incomingRequests.fetchIncomingFollowRequests.length === 0 && (
                    <h4 className="text-center">
                      You do not have any follow requests.
                    </h4>
                  )}
                {incomingRequests.fetchIncomingFollowRequests &&
                  incomingRequests.fetchIncomingFollowRequests.length > 0 &&
                  incomingRequests.fetchIncomingFollowRequests.map((user) => (
                    <div className="flex items-center p-3 border">
                      <Avatar>
                        <AvatarImage
                          src={user.pfpPath}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback>
                          {user.firstName[0] + user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex justify-between flex-1 ml-3">
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {user.firstName + " " + user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{user.userName}
                          </p>
                        </div>

                        <div className="*:mx-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-red-400/40"
                            onClick={() => {
                              handleReject(user._id);
                            }}
                          >
                            <X />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-green-400/40"
                            onClick={() => {
                              handleAccept(user._id, user.firstName);
                            }}
                          >
                            <Check />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="flex-1">
                {sentRequests.fetchSentFollowRequests &&
                  sentRequests.fetchSentFollowRequests.length === 0 && (
                    <h4 className="text-center">
                      You have not sent any follow requests.
                    </h4>
                  )}
                {sentRequests.fetchSentFollowRequests &&
                  sentRequests.fetchSentFollowRequests.length > 0 &&
                  sentRequests.fetchSentFollowRequests.map((user) => (
                    <div className="flex items-center p-3 border">
                      <Avatar>
                        <AvatarImage
                          src={user.pfpPath}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback>
                          {user.firstName[0] + user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex justify-between flex-1 ml-3">
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {user.firstName + " " + user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{user.userName}
                          </p>
                        </div>

                        <div className="">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-full"
                            onClick={() => {
                              handleCancel(user.userName);
                            }}
                          >
                            Undo
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </main>
        </Suspense>
      </ErrorBoundary>
    </Suspense>
  );
};

export default Requests;
