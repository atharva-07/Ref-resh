import {
  ApolloClient,
  ApolloLink,
  concat,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import axios from "axios";
import { print } from "graphql";

axios.defaults.baseURL = import.meta.env.VITE_NODE_SERVER_URI;

axios.interceptors.response.use(async (response) => {
  if (response.data.errors && response.data.errors.length > 0) {
    const error = response.data.errors[0];
    if (error.code === 401 && error.message === "Unauthorized") {
      // && !originalRequest._retry)
      // originalRequest._retry = true; // Avoid infinite loops
      const originalRequest = response.config;

      //  TODO: (FIXME) We are able to access the cookie because it is NOT http-only
      // but it should be.
      // const refreshToken = document.cookie
      //   .split("; ")
      //   .find((row) => row.startsWith("refreshToken="))
      //   ?.split("=")[1];

      try {
        // const { data } =
        await axios.post(
          `${import.meta.env.VITE_OAUTH_SERVER_URI}/refresh-token`,
          // { refreshToken }
          {}, // Empty body object because we are using cookies to send the refresh token.
          { withCredentials: true }
        );

        // axios.defaults.headers.common[
        //   "Authorization"
        // ] = `Bearer ${data.accessToken}`;
        // originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;

        return axios(originalRequest);
      } catch (error) {
        console.log(error);
      }
    }
  }

  return response;
});

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      // TODO: The header will come from cookie.
      Authorization: `Bearer ${localStorage.getItem("access-token")}` || null,
    },
  }));
  return forward(operation);
});

const axiosLink = new ApolloLink((operation) => {
  return new Observable((observer) => {
    axios({
      url: import.meta.env.VITE_NODE_SERVER_URI,
      method: "POST",
      withCredentials: true,
      data: {
        query: print(operation.query),
        variables: operation.variables,
      },
      headers: operation.getContext().headers,
    })
      .then((response) => {
        observer.next(response.data);
        observer.complete();
      })
      .catch((error) => {
        observer.error(error);
      });
  });
});

export const client = new ApolloClient({
  // link: concat(authMiddleware, axiosLink),
  link: axiosLink,
  cache: new InMemoryCache(),
});
