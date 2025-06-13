import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import User, { AuthType } from "../models/User";
import { handleTokenCreationAndRedirection } from "../utils/common";
import {
  FacebookUserResult,
  getFacebookIdAndAccessToken,
  getFacebookOAuthUriWithOptions,
} from "../utils/facebook";

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

    if (!storedState || returnedState !== storedState) {
      return res.status(400).send("Invalid state parameter");
    }

    try {
      const { id_token } = await getFacebookIdAndAccessToken(code);

      const facebookUser: FacebookUserResult = jwt.decode(
        id_token
      ) as FacebookUserResult;
      console.log(facebookUser);

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
      }

      handleTokenCreationAndRedirection(user, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
