import axios from "axios";
import qs from "querystring";

import logger from "./winston";

export interface FacebookTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

export interface FacebookUserResult {
  sub: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  iat: number;
  exp: number;
}

export const getFacebookOAuthUriWithOptions = (state: string): string => {
  const facebookOAuthUri: string = process.env
    .FACEBOOK_OAUTH2_AUTH_URI as string;

  const options = {
    client_id: process.env.FACEBOOK_OAUTH2_CLIENT_ID as string,
    redirect_uri: process.env.FACEBOOK_OAUTH2_REDIRECT_URIS as string,
    response_type: "code",
    state: state,
    // code_challenge: process.env.FACEBOOK_OAUTH2_CODE_CHALLENGE as string,
    // code_challenge_method: process.env
    //   .FACEBOOK_OAUTH2_CODE_CHALLENGE_METHOD as string,
    scope: ["openid"].join(" "),
  };

  const queryString = new URLSearchParams(options);
  return `${facebookOAuthUri}?${queryString.toString()}`;
};

export const getFacebookIdAndAccessToken = async (
  authorization_code: string,
): Promise<FacebookTokenResponse> => {
  const url = process.env.FACEBOOK_OAUTH2_TOKEN_URI as string;

  const values = {
    code: authorization_code,
    //  code_verifier: process.env.FACEBOOK_OAUTH2_CODE_VERIFIER,
    client_id: process.env.FACEBOOK_OAUTH2_CLIENT_ID,
    client_secret: process.env.FACEBOOK_OAUTH2_CLIENT_SECRET,
    redirect_uri: process.env.FACEBOOK_OAUTH2_REDIRECT_URIS,
  };

  try {
    const res = await axios.post<FacebookTokenResponse>(
      url,
      qs.stringify(values),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    logger.info(`Facebook OAuth2 response: ${JSON.stringify(res.data)}`);

    return res.data;
  } catch (error: any) {
    logger.error(
      `Error fetching Facebook OAuth2 token. Error: ${error.message}`,
    );
    throw new Error(error.message);
  }
};
