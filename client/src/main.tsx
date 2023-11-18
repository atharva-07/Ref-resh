import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ApolloProvider } from "@apollo/client";
import store from "./store";
import { client } from "./middlewares/auth.ts";
import { Provider as ReduxProvider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </ReduxProvider>
  </React.StrictMode>
);
