import moment from "moment";

import { AvatarBgColors } from "./utility-types";

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

export const getAbsoluteTime = (timestamp: string) => {
  return new Date(parseInt(timestamp)).toLocaleString();
};

export const getRandomAvatarBgColor = (max: number = 15) => {
  const randomColorIndex = Math.floor(Math.random() * max);
  const randomAvatarBgColor = AvatarBgColors[randomColorIndex];
  return randomAvatarBgColor;
};
