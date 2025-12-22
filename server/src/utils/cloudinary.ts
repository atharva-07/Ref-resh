import { v2 as cloudinary } from "cloudinary";

import logger from "./winston";

export const CL_POST_FOLDER = "post-images";
export const CL_PFP_FOLDER = "pfp-images";
export const CL_BANNER_FOLDER = "banner-images";
export const CL_STORY_FOLDER = "story-images";

export const uploadSingleFile = (
  file: Express.Multer.File,
  folderName: string,
) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        folder: folderName,
      },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(error);
        }
      },
    );
  });
};

export const uploadMultipleFiles = async (
  files: Express.Multer.File[],
  folderName: string,
) => {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map((file) =>
    uploadSingleFile(file, folderName),
  );

  try {
    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    logger.error("Error uploading files to Cloudinary: ", error);
    throw new Error("Failed to upload images.");
  }
};
