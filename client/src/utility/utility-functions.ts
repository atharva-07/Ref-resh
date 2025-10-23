import moment from "moment";

import { ACCEPTED_IMAGE_TYPES, AvatarBgColors } from "./utility-types";

export const ISO_STRING_FORMAT = "YYYY-MM-DDTHH:mm:ss.sssZ";

export const transformTimestamps = (createdAt: string, updatedAt: string) => {
  return {
    createdAt: new Date(parseInt(createdAt)).toISOString(),
    updatedAt: new Date(parseInt(updatedAt)).toISOString(),
  };
};

export const getISOStringFromTimestamp = (timestamp: string) => {
  return new Date(parseInt(timestamp)).toISOString();
};

// The timestamp passed in should be in ISO string format
export const getRelativeTime = (
  timestamp: string,
  format: string = ISO_STRING_FORMAT
) => {
  return moment(timestamp, format).fromNow();
};

// October 2025
export const getMonthAndYear = (timestamp: string) => {
  return moment(timestamp).format("MMMM YYYY");
};

// Oct 23, 2025
export const getDateInShortForm = (timestamp: string) => {
  return moment(timestamp).format("ll");
};

export const getAbsoluteTime = (timestamp: string) => {
  return new Date(parseInt(timestamp)).toLocaleString();
};

export const formatDateForChat = (isoString: string) => {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    // Customize date format as needed
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }
};

export const getRandomAvatarBgColor = (mode: string, max: number = 15) => {
  const randomColorIndex = Math.floor(Math.random() * max);
  const randomAvatarBgColor = AvatarBgColors[randomColorIndex];
  return randomAvatarBgColor.concat(mode === "dark" ? "800" : "300");
};

export const validateImageFile = (
  file: File | undefined,
  maxSizeBytes: number
): string[] => {
  const errors: string[] = [];

  if (!file) {
    return errors;
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    errors.push(
      "Invalid file type. Only .jpg, .jpeg, .png, and .webp formats are supported."
    );
  }

  if (file.size > maxSizeBytes) {
    errors.push(`File size must be less than ${maxSizeBytes / 1024 / 1024}MB.`);
  }

  return errors;
};
