import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./styles/global.css";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
  CardFooter,
  CardDescription,
} from "./components/ui/card";
import { ThemeProvider } from "./context/theme";
import { ModeToggle } from "./components/theme-toggle";
// import { gql } from "@apollo/client/core";
// import { useQuery } from "@apollo/client/react";

// const GET_USER_PROFILE = gql`
//   query FetchUserProfile($userName: String!) {
//     fetchUserProfile(userName: $userName) {
//       _id
//       firstName
//       lastName
//       userName
//       email
//       password
//       gender
//       dob
//       privateAccount
//       joinedDate
//       pfpPath
//       bannerPath
//       bio
//       authType
//       lastLogin
//       followers {
//         userName
//       }
//       following {
//         userName
//       }
//       createdAt
//       updatedAt
//     }
//   }
// `;

function App() {
  const [count, setCount] = useState(0);
  // const { data, error } = useQuery(GET_USER_PROFILE, {
  //   variables: {
  //     userName: "athar.wankh_214",
  //   },
  // });

  // console.log(data);
  // console.log(error?.message, error?.name);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <ModeToggle />
      <Card>
        <CardHeader>
          <CardTitle className="text-primary dark:text-primary">
            Card Title
          </CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </ThemeProvider>
  );
}

export default App;
