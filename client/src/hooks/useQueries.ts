import { useQuery } from "@apollo/client";

import {
  GET_FEED,
  GET_INCOMING_FOLLOW_REQUESTS,
  GET_UNREAD_CHATS_COUNT,
  GET_UNREAD_NOTIFICATIONS_COUNT,
  GET_UPCOMING_BIRTHDAYS,
} from "@/gql-calls/queries";
import { FEED_PAGE_SIZE } from "@/utility/constants";

export const useHomePageQueries = () => {
  const queryResults = {
    GET_FEED: {},
    GET_UNREAD_NOTIFICATIONS_COUNT: {},
    GET_UNREAD_CHATS_COUNT: {},
    GET_UPCOMING_BIRTHDAYS: {},
    GET_INCOMING_FOLLOW_REQUESTS: {},
  };
  const {
    data: posts,
    error: postsError,
    loading: postsLoading,
  } = useQuery(GET_FEED, {
    variables: {
      pageSize: FEED_PAGE_SIZE,
      after: "", // TODO: FIXME ASAP
    },
  });
  queryResults.GET_FEED = {
    data: posts,
    error: postsError,
    loading: postsLoading,
  };

  const {
    data: notificationsCount,
    error: notificationsCountError,
    loading: notificationsCountLoading,
  } = useQuery(GET_UNREAD_NOTIFICATIONS_COUNT);
  queryResults.GET_UNREAD_NOTIFICATIONS_COUNT = {
    data: notificationsCount,
    error: notificationsCountError,
    loading: notificationsCountLoading,
  };

  const {
    data: chatsCount,
    error: chatsError,
    loading: chatsLoading,
  } = useQuery(GET_UNREAD_CHATS_COUNT);
  queryResults.GET_UNREAD_CHATS_COUNT = {
    data: chatsCount,
    error: chatsError,
    loading: chatsLoading,
  };

  const {
    data: birthdays,
    error: birthdaysError,
    loading: birthdaysLoading,
  } = useQuery(GET_UPCOMING_BIRTHDAYS);
  queryResults.GET_UPCOMING_BIRTHDAYS = {
    data: birthdays,
    error: birthdaysError,
    loading: birthdaysLoading,
  };

  const {
    data: followRequests,
    error: followRequestsError,
    loading: followRequestsLoading,
  } = useQuery(GET_INCOMING_FOLLOW_REQUESTS);
  queryResults.GET_INCOMING_FOLLOW_REQUESTS = {
    data: followRequests,
    error: followRequestsError,
    loading: followRequestsLoading,
  };

  return queryResults;
};
