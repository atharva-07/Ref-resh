// PAGE_SIZES
export const FEED_PAGE_SIZE: number = 10;
export const MESSAGES_PAGE_SIZE: number = 15;
export const COMMENTS_PAGE_SIZE: number = 5;
export const USERS_PAGE_SIZE: number = 10;
export const NOTIFICATIONS_PAGE_SIZE: number = 10;

// IMAGE_SIZES
export const PFP_MAX_SIZE_IN_BYTES: number = 2 * 1024 * 1024;
export const BANNER_MAX_SIZE_IN_BYTES: number = 5 * 1024 * 1024;
export const POST_MAX_SIZE_IN_BYTES: number = 4 * 1024 * 1024;

// NOTIFICATIONS

export enum NotificationEvents {
  LIKED_POST = "LP",
  LIKED_COMMENT = "LC",
  COMMENTED_ON_POST = "CP",
  REPLIED_TO_COMMENT = "RC",
  FOLLOWED = "FLW",
  FOLLOW_REQUEST_RECEIVED = "FRR",
  FOLLOW_REQUEST_ACCEPTED = "FRA",
}

export const eventColorMap: Map<NotificationEvents, string> = new Map([
  [NotificationEvents.LIKED_POST, "red-500"],
  [NotificationEvents.LIKED_COMMENT, "yellow-500"],
  [NotificationEvents.FOLLOW_REQUEST_ACCEPTED, "green-500"],
  [NotificationEvents.FOLLOW_REQUEST_RECEIVED, "violet-500"],
  [NotificationEvents.COMMENTED_ON_POST, "blue-500"],
  [NotificationEvents.REPLIED_TO_COMMENT, "blue-500"],
  [NotificationEvents.FOLLOWED, "green-500"],
]);

export const eventMessageMap: Map<NotificationEvents, string> = new Map([
  [NotificationEvents.LIKED_POST, "liked your post."],
  [NotificationEvents.LIKED_COMMENT, "liked your comment."],
  [NotificationEvents.FOLLOW_REQUEST_ACCEPTED, "accepted your follow request."],
  [NotificationEvents.FOLLOW_REQUEST_RECEIVED, "wants to follow you."],
  [NotificationEvents.COMMENTED_ON_POST, "commented on your post."],
  [NotificationEvents.REPLIED_TO_COMMENT, "replied to your comment."],
  [NotificationEvents.FOLLOWED, "started following you."],
]);
