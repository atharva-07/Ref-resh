"use client";

import { useLazyQuery, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { authActions, user } from "@/store/auth-slice";

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
            email: form.getValues("email"),
            password: form.getValues("password"),
          },
        },
        fetchPolicy: "network-only",
      });

      if (data.credentialsLogin) {
        const { access_token, refresh_token, __typename, ...payload } =
          data.credentialsLogin;
        dispatch(authActions.setUser(payload));
        dispatch(authActions.setIsAuthenticated(true));
        // TODO: Notfications connect here.
        navigate("/");
      }
    } catch (err) {
      /* empty */
    } // TODO: Is something even required here?
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-[22rem] child:mb-5"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-red-700">{error?.message}</p>}
        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Login"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
