import axios from "axios";
import qs from "querystring";

export interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleUserResult {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  iat: number;
  exp: number;
}

export const getGoogleOAuthUriWithOptions = (state: string): string => {
  const googleOAuthUri: string = process.env.GOOGLE_OAUTH2_AUTH_URI as string;
  const options = {
    client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID as string,
    redirect_uri: process.env.GOOGLE_OAUTH2_REDIRECT_URIS as string,
    access_type: "online", // can also be "offline" to get back refresh_token
    response_type: "code", // can also be "token" but it returns access error for access_type = "offline"
    prompt: "consent", // select_account
    state: state,
    scope: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
  };

  const queryString = new URLSearchParams(options);
  return `${googleOAuthUri}?${queryString.toString()}`;
};

export const getGoogleIdAndAccessToken = async (
  code: string
): Promise<GoogleTokenResponse> => {
  const url = process.env.GOOGLE_OAUTH2_TOKEN_URI as string;

  const values = {
    code: code,
    client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID,
    client_secret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_OAUTH2_REDIRECT_URIS,
    grant_type: "authorization_code",
  };

  try {
    const res = await axios.post<GoogleTokenResponse>(
      url,
      qs.stringify(values),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log(res.data);
    return res.data;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
};

// export const getGoogleUser = async (
//   access_token: string,
//   id_token: string
// ): Promise<GoogleUserResult> => {
//   try {
//     const res = await axios.get<GoogleUserResult>(
//       `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
//       {
//         headers: {
//           Authorization: `Bearer ${id_token}`,
//         },
//       }
//     );
//     console.log(res.data);
//     return res.data;
//   } catch (error: any) {
//     console.log(error, "ERROR: Couldn't fetch Google user.");
//     throw new Error(error.message);
//   }
// };

// interface GooglePublicKey {
//   e: string;
//   n: string;
//   use: string;
//   alg: string;
//   kty: string;
//   kid: string;
// }

// export const getGooglePublicKey = async (
//   keyId: string
// ): Promise<GooglePublicKey[]> => {
//   try {
//     const res = await axios.get<any>(
//       `${process.env.GOOGLE_OAUTH2_PUBLIC_KEY_URI}`
//     );
//     const publicSigningKey = res.data.keys.find(
//       (x: GooglePublicKey) => x.kid === keyId
//     );
//     return publicSigningKey;
//   } catch (error: any) {
//     console.log(error, "ERROR: Couldn't fetch Google public key.");
//     throw new Error(error.message);
//   }
// };
