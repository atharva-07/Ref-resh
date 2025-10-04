import { useMutation, useQuery, useSuspenseQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import Notification, {
  NotificationProps,
} from "@/components/main/notification/notification";
import { SET_READ_NOTIFICATIONS_AT } from "@/gql-calls/mutation";
import { GET_NOTIFICATIONS, PaginatedData } from "@/gql-calls/queries";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { notificationActions } from "@/store/notifications-slice";
import { NOTIFICATIONS_PAGE_SIZE } from "@/utility/constants";
import { transformTimestamps } from "@/utility/utility-functions";

const NotificationsSeparator = ({
  readStatus,
}: {
  readStatus: "Read" | "Unread";
}) => {
  return (
    <div
      style={{
        padding: "16px",
        fontSize: "0.8rem",
        fontWeight: "bold",
      }}
    >
      <span>{readStatus}</span>
    </div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [ref, inView] = useInView();

  const dispatch = useAppDispatch();

  const [setReadNotificationsAt, { data: mutationData }] = useMutation(
    SET_READ_NOTIFICATIONS_AT
  );

  const { data, fetchMore } = useQuery<{
    [key: string]: PaginatedData<NotificationProps>;
  }>(GET_NOTIFICATIONS, {
    variables: {
      pageSize: NOTIFICATIONS_PAGE_SIZE,
      after: null,
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data && data[Object.keys(data)[0]].edges) {
      const fieldName = Object.keys(data)[0];
      setNotifications((prevNotifs) => {
        const existingNotifIds = new Set(prevNotifs.map((u) => u._id));
        const newNotifs = data[fieldName].edges
          .map((edge) => edge.node)
          .filter((node) => !existingNotifIds.has(node._id));

        return [...prevNotifs, ...newNotifs];
      });
      setHasNextPage(data[fieldName].pageInfo.hasNextPage);
      setEndCursor(data[fieldName].pageInfo.endCursor);
    }
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !loadingMore) {
      setLoadingMore(true);

      fetchMore({
        variables: {
          pageSize: NOTIFICATIONS_PAGE_SIZE,
          after: endCursor,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prevResult;
          }

          const fieldName = Object.keys(fetchMoreResult)[0];
          const newEdges = fetchMoreResult[fieldName].edges || [];
          const newPageInfo = fetchMoreResult[fieldName].pageInfo;
          const updatedEdges = [
            ...(prevResult[fieldName]?.edges || []),
            ...newEdges,
          ];

          return {
            [fieldName]: {
              ...prevResult[fieldName],
              edges: updatedEdges,
              pageInfo: newPageInfo,
            },
          };
        },
      }).finally(() => setLoadingMore(false));
    }
  }, [inView, hasNextPage, endCursor, fetchMore, loadingMore]);

  useEffect(() => {
    // If the notifications page is left before 5 seconds,
    // do not update the timestamp.
    const timer = setTimeout(() => {
      setReadNotificationsAt();
      dispatch(notificationActions.readNotifications());
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [setReadNotificationsAt, dispatch]);

  const noUnread = notifications.find((notif) => notif.unread === true);

  return (
    <div className="w-4/5 *:w-4/5 *:mx-auto *:border">
      {notifications.length === 0 && (
        <h4 className="p-4">You do not have any notifications.</h4>
      )}
      {notifications.length > 0 && !noUnread && (
        <h4 className="p-4">You do not have any unread notifications.</h4>
      )}
      {notifications.length > 0 &&
        notifications.map((notif, idx) => {
          const timestamps = transformTimestamps(
            notif.createdAt,
            notif.updatedAt
          );

          const showSeparator =
            idx === 0 ||
            (notif.unread && !notifications[idx - 1].unread) ||
            (!notif.unread && notifications[idx - 1].unread);

          return (
            <div>
              {showSeparator && (
                <NotificationsSeparator
                  readStatus={notif.unread ? "Unread" : "Read"}
                />
              )}
              <Notification key={notif._id} {...notif} {...timestamps} />
            </div>
          );
        })}
      {hasNextPage && <div ref={ref} className="h-1"></div>}

      {loadingMore && (
        <div className="flex justify-center my-4">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}
    </div>
  );
};

export default Notifications;
