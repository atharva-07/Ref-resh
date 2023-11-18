import { AvatarBgColors } from "./utility-types";

export const transformTimestamps = (createdAt: string, updatedAt: string) => {
  return {
    createdAt: new Date(parseInt(createdAt)).toISOString(),
    updatedAt: new Date(parseInt(updatedAt)).toISOString(),
  };
};

export const getRandomAvatarBgColor = (max: number = 15) => {
  const randomColorIndex = Math.floor(Math.random() * max);
  const randomAvatarBgColor = AvatarBgColors[randomColorIndex];
  return randomAvatarBgColor;
};
