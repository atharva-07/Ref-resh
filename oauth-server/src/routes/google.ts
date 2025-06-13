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

    if (!storedState || returnedState !== storedState) {
      return res.status(400).send("Invalid state parameter");
    }

    try {
      const { id_token } = await getGoogleIdAndAccessToken(code);

      // Get userinfo from Google's userinfo endpoint using access_token and id_token
      // const googleUser = await getGoogleUser(access_token, id_token);
      const googleUser: GoogleUserResult = jwt.decode(
        id_token
      ) as GoogleUserResult;
      console.log(googleUser);

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
      }

      handleTokenCreationAndRedirection(user, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
