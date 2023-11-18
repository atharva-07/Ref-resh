import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  ApolloLink,
  concat,
} from "@apollo/client";

const httpLink = new HttpLink({ uri: "http://localhost:4000/api" });

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: `Bearer ${localStorage.getItem("token")}` || null,
    },
  }));

  return forward(operation);
});

export const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  // uri: "http://localhost:4000/api",
  cache: new InMemoryCache(),
});