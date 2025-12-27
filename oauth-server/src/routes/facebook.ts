import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import User, { AuthType } from "../models/User.js";
import { handleTokenCreationAndRedirection } from "../utils/common.js";
import {
  FacebookUserResult,
  getFacebookIdAndAccessToken,
  getFacebookOAuthUriWithOptions,
} from "../utils/facebook.js";
import logger from "../utils/winston.js";

const router = Router();

router.get("/api/facebook", (req: Request, res: Response) => {
  const state = uuidv4();
  req.session.state = state;

  const FACEBOOK_OAUTH_URI = getFacebookOAuthUriWithOptions(state);

  res.redirect(FACEBOOK_OAUTH_URI);
});

router.get(
  "/api/oauth/facebook",
  async (req: Request, res: Response, next: NextFunction) => {
    const code = req.query.code as string;
    const returnedState = req.query.state as string;
    const storedState = req.session.state;

    if (req.query.error === "access_denied") {
      logger.warn("Facebook: User denied access.");
      return res.status(403).send("Access denied by the user.");
    }

    if (!storedState || returnedState !== storedState) {
      logger.error("Facebook: Invalid state parameter.");
      return res.status(400).send("Invalid state parameter");
    }

    try {
      if (!code) {
        logger.error("Facebook: Missing authorization code.");
        throw new Error("Missing authorization code.");
      }

      logger.info(`Facebook Authorization Code: ${code}`);
      const { id_token } = await getFacebookIdAndAccessToken(code);

      const facebookUser: FacebookUserResult = jwt.decode(
        id_token,
      ) as FacebookUserResult;

      logger.debug(`Facebook User Info: ${JSON.stringify(facebookUser)}`);

      // Upsert (Update or Insert) user in database
      let user = await User.findOne({ email: facebookUser.email });
      if (!user) {
        user = new User({
          firstName: facebookUser.given_name,
          lastName: facebookUser.family_name,
          userName: uuidv4(),
          email: facebookUser.email,
          authType: AuthType.FACEBOOK,
          joinedDate: new Date(),
          pfpPath: facebookUser.picture,
        });
        user = await user.save();
        logger.info(`New user created with Facebook OAuth: ${user.email}`);
      }

      handleTokenCreationAndRedirection(user, res);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
