import { v4 as uuidv4 } from "uuid";

export const getFacebookOAuthLink = () => {
  const rootUrl = import.meta.env.VITE_FACEBOOK_OAUTH2_AUTH_URI;

  const state = uuidv4();

  const options = {
    client_id: import.meta.env.VITE_FACEBOOK_OAUTH2_CLIENT_ID as string,
    redirect_uri: import.meta.env.VITE_FACEBOOK_OAUTH2_REDIRECT_URIS as string,
    response_type: "code",
    state: state,
    code_challenge: import.meta.env
      .VITE_FACEBOOK_OAUTH2_CODE_CHALLENGE as string,
    code_challenge_method: import.meta.env
      .VITE_FACEBOOK_OAUTH2_CODE_CHALLENGE_METHOD as string,
    scope: ["openid"].join(" "),
  };

  const queryString = new URLSearchParams(options);

  return `${rootUrl}?${queryString.toString()}`;
};
