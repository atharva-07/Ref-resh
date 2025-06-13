import { v4 as uuidv4 } from "uuid";

export const getGoogleOAuthLink = () => {
  const rootUrl = import.meta.env.VITE_GOOGLE_OAUTH2_AUTH_URI;

  const state = uuidv4();

  const options = {
    client_id: import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID as string,
    redirect_uri: import.meta.env.VITE_GOOGLE_OAUTH2_REDIRECT_URIS as string,
    access_type: "offline", // can also be "online" but then we won't get back refresh_token
    response_type: "code", // can also be "token" but it returns access error for access_type = "offline"
    prompt: "consent", // select_account
    state: state,
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
  };

  const queryString = new URLSearchParams(options);

  return `${rootUrl}?${queryString.toString()}`;
};
