"use client";

import { useLazyQuery, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LOGIN } from "@/gql-calls/queries";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { cn } from "@/lib/utils";
import { authActions, user } from "@/store/auth-slice";
import { socketActions } from "@/store/middlewares/socket-middleware";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export const GOOGLE_OAUTH_URI =
  import.meta.env.VITE_OAUTH_SERVER_URI + "/google";
export const FACEBOOK_OAUTH_URI =
  import.meta.env.VITE_OAUTH_SERVER_URI + "/facebook";

const formSchema = z.object({
  email: z.string({ required_error: "Email cannot be empty." }).email(),
  password: z
    .string({ required_error: "Password cannot be empty." })
    .min(8, {
      message: "Password should be at least 8 characters long.",
    })
    .max(20, {
      message: "Password cannot be more than 20 characters long.",
    })
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/gm,
      {
        message:
          "Password must have at least one uppercase letter, one lowercase letter, one number and one special character.",
      }
    ),
});

const LoginForm = () => {
  // const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [login, { error, loading }] = useLazyQuery(LOGIN);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    try {
      const { data } = await login({
        variables: {
          loginData: {
            email: values.email.trim(),
            password: values.password.trim(),
          },
        },
        fetchPolicy: "network-only",
      });

      if (data.credentialsLogin) {
        const { access_token, refresh_token, __typename, ...payload } =
          data.credentialsLogin;
        dispatch(authActions.setUser(payload));
        dispatch(authActions.setIsAuthenticated(true));
        dispatch({ type: socketActions.connect });
        // TODO: Notfications connect here.
        navigate("/");
      }
    } catch (error) {
      /* empty */
    } // TODO: Is something even required here?
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Google or Facebook account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = GOOGLE_OAUTH_URI)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Login with Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = FACEBOOK_OAUTH_URI)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M23.9981 11.9991C23.9981 5.37216 18.626 0 11.9991 0C5.37216 0 0 5.37216 0 11.9991C0 17.9882 4.38789 22.9522 10.1242 23.8524V15.4676H7.07758V11.9991H10.1242V9.35553C10.1242 6.34826 11.9156 4.68714 14.6564 4.68714C15.9692 4.68714 17.3424 4.92149 17.3424 4.92149V7.87439H15.8294C14.3388 7.87439 13.8739 8.79933 13.8739 9.74824V11.9991H17.2018L16.6698 15.4676H13.8739V23.8524C19.6103 22.9522 23.9981 17.9882 23.9981 11.9991Z"
                    fill="currentColor"
                  />
                </svg>
                Login with Facebook
              </Button>
            </div>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-card text-muted-foreground relative z-10 px-2">
                Or continue with
              </span>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <div className="grid gap-3">
                        <FormItem>
                          <FormLabel htmlFor="email">Email</FormLabel>
                          <FormControl>
                            <Input
                              id="email"
                              type="email"
                              placeholder="kj@refresh.com"
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <div className="grid gap-3">
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel htmlFor="password">Password</FormLabel>
                            {/* <a
                              href="#"
                              className="ml-auto text-sm underline-offset-4 hover:underline"
                            >
                              Forgot your password?
                            </a> */}
                          </div>
                          <FormControl>
                            <Input
                              id="password"
                              type="password"
                              placeholder="cutiecat123"
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </div>
                    )}
                  />
                  {error && (
                    <p className="text-sm text-red-700">{error?.message}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Login"}
                  </Button>
                </div>
              </form>
            </Form>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4">
                Create one.
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
