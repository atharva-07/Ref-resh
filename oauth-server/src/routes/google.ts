import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import User, { AuthType } from "../models/User";
import { handleTokenCreationAndRedirection } from "../utils/common";
import {
  getGoogleIdAndAccessToken,
  getGoogleOAuthUriWithOptions,
  GoogleUserResult,
} from "../utils/google";
import logger from "../utils/winston";

const router = Router();

router.get("/api/google", (req: Request, res: Response) => {
  const state = uuidv4();
  req.session.state = state;

  const GOOGLE_OAUTH_URI = getGoogleOAuthUriWithOptions(state);

  res.redirect(GOOGLE_OAUTH_URI);
});

router.get(
  "/api/oauth/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const code = req.query.code as string;
    const returnedState = req.query.state as string;
    const storedState = req.session.state as string;

    if (req.query.error === "access_denied") {
      logger.warn("Google: User denied access.");
      return res.status(403).send("Access denied by the user.");
    }

    if (!storedState || returnedState !== storedState) {
      logger.error("Google: Invalid state parameter.");
      return res.status(400).send("Invalid state parameter");
    }

    try {
      if (!code) {
        logger.error("Google: Missing authorization code.");
        throw new Error("Missing authorization code.");
      }

      logger.info(`Google Authorization Code: ${code}`);
      const { id_token } = await getGoogleIdAndAccessToken(code);

      // Get userinfo from Google's userinfo endpoint using access_token and id_token
      // const googleUser = await getGoogleUser(access_token, id_token);
      const googleUser: GoogleUserResult = jwt.decode(
        id_token,
      ) as GoogleUserResult;

      logger.debug(`Google User Info: ${JSON.stringify(googleUser)}`);

      if (!googleUser.email_verified) {
        return res.status(403).send("Google account is not verified");
      }

      // Upsert (Update or Insert) user in database
      let user = await User.findOne({ email: googleUser.email });
      if (!user) {
        user = new User({
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          userName: uuidv4(),
          email: googleUser.email,
          authType: AuthType.GOOGLE,
          joinedDate: new Date(),
          pfpPath: googleUser.picture,
        });
        user = await user.save();
        logger.info(`New user created with Google OAuth: ${user.email}`);
      }

      handleTokenCreationAndRedirection(user, res);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
