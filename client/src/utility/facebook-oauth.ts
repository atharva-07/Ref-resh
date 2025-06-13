// import crypto from "node:crypto";

export const getFacebookOAuthLink = () => {
  const rootUrl = import.meta.env.VITE_FACEBOOK_OAUTH2_AUTH_URI;

  // TODO
  // const state = crypto.randomBytes(32).toString("hex");
  const state = "cringemaniac69";
  // Generate "nonce" as well and pass in as an option

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
