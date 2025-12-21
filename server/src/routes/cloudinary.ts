import { Router } from "express";
import { GraphQLError } from "graphql";

import imageUploadMiddleware from "../middleware/image-upload";
import {
  CL_BANNER_FOLDER,
  CL_PFP_FOLDER,
  CL_POST_FOLDER,
  CL_STORY_FOLDER,
  uploadMultipleFiles,
  uploadSingleFile,
} from "../utils/cloudinary";

const router = Router();

router.post(
  "/api/upload/post",
  imageUploadMiddleware.array("images", 4),
  async (req, res, next) => {
    try {
      if (!req.isAuthenticated) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: 401,
          },
        });
      }

      const imageFiles = req.files as Express.Multer.File[];

      let imagesUrls = null;
      if (imageFiles) {
        imagesUrls = await uploadMultipleFiles(imageFiles, CL_POST_FOLDER);
      }

      const result = {
        imagesUrls,
      };

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
);

router.post(
  "/api/upload/profile",
  imageUploadMiddleware.fields([
    { name: "pfpPath", maxCount: 1 },
    { name: "bannerPath", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      if (!req.isAuthenticated) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: 401,
          },
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const profilePictureFile = files?.pfpPath ? files.pfpPath[0] : null;
      const bannerPictureFile = files?.bannerPath ? files.bannerPath[0] : null;

      let pfpUrl = null;
      let bannerUrl = null;

      if (profilePictureFile) {
        pfpUrl = await uploadSingleFile(profilePictureFile, CL_PFP_FOLDER);
      }

      if (bannerPictureFile) {
        bannerUrl = await uploadSingleFile(bannerPictureFile, CL_BANNER_FOLDER);
      }

      const result = {
        pfpUrl,
        bannerUrl,
      };

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
);

router.post(
  "/api/upload/story",
  imageUploadMiddleware.fields([{ name: "image", maxCount: 1 }]),
  async (req, res, next) => {
    try {
      if (!req.isAuthenticated) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: 401,
          },
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageFile = files?.image ? files.image[0] : null;

      let imageUrl = null;

      if (imageFile) {
        imageUrl = await uploadSingleFile(imageFile, CL_STORY_FOLDER);
      }

      const result = {
        imageUrl,
      };

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
);

export default router;
