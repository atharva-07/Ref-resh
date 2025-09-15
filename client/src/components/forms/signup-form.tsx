"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Command,
  GalleryVerticalEnd,
  NavigationOff,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { cn } from "@/components/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SIGNUP } from "@/gql-calls/mutation";
import { useAppDispatch } from "@/hooks/useAppDispatch";

import Calendar13 from "../ui/calendar-13";
import { FACEBOOK_OAUTH_URI, GOOGLE_OAUTH_URI } from "./login-form";

const formSchema = z
  .object({
    firstname: z
      .string({ required_error: "First Name cannot be empty." })
      .min(1, { message: "First Name should at least have 1 character." })
      .max(26, { message: "First Name cannot have more than 26 characters." }),
    lastname: z
      .string({ required_error: "Last Name cannot be empty." })
      .min(1, { message: "Last Name should at least have 1 character." })
      .max(26, { message: "Last Name cannot have more than 26 characters." }),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
      required_error: "You need to select a gender.",
    }),
    dateofbirth: z.date({ required_error: "Date of Birth cannot be empty." }),
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
    confirmpassword: z.string({
      required_error: "Re-entered Password cannot be empty.",
    }),
    authtype: z.enum(["EMAIL", "GOOGLE", "FACEBOOK"]),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

const SignupForm = () => {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      gender: "MALE",
      dateofbirth: new Date(),
      password: "",
      confirmpassword: "",
      authtype: "EMAIL",
    },
  });

  const [signup, { error, loading }] = useMutation(SIGNUP);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {
      const { data } = await signup({
        variables: {
          signupData: {
            firstName: values.firstname,
            lastName: values.lastname,
            dob: values.dateofbirth
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, "/"),
            gender: values.gender,
            email: values.email,
            password: values.password,
          },
        },
      });

      if (data.signup) {
        const id = data.signup;
        navigate("/login");
      }
    } catch (error) {
      //
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <div className="grid gap-3">
                    <FormItem>
                      <FormLabel htmlFor="firstname">First Name</FormLabel>
                      <FormControl>
                        <Input
                          id="firstname"
                          type="text"
                          placeholder="John"
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
                name="lastname"
                render={({ field }) => (
                  <div className="grid gap-3">
                    <FormItem>
                      <FormLabel htmlFor="lastname">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          id="lastname"
                          type="text"
                          placeholder="Doe"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
            </div>
            <div className="flex justify-between">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <div className="grid gap-3">
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col"
                        >
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem
                                id="male"
                                className="hover:cursor-pointer"
                                value="MALE"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="male"
                              className="font-normal hover:cursor-pointer"
                            >
                              Male
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem
                                id="female"
                                className="hover:cursor-pointer"
                                value="FEMALE"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="female"
                              className="font-normal hover:cursor-pointer"
                            >
                              Female
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem
                                id="other"
                                className="hover:cursor-pointer"
                                value="OTHER"
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor="other"
                              className="font-normal hover:cursor-pointer"
                            >
                              Non-Binary
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="dateofbirth"
                render={({ field }) => (
                  <div className="grid gap-3">
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar13
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date: Date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
            </div>
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
            <div className="flex justify-between">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <div className="grid gap-3">
                    <FormItem>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Password"
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
                name="confirmpassword"
                render={({ field }) => (
                  <div className="grid gap-3">
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          id="confirmpassword"
                          type="password"
                          placeholder="Re-enter your password"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
            </div>
            {error && <p className="text-sm text-red-700">{error?.message}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Signup"}
            </Button>
          </div>
        </form>
      </Form>
      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-background text-muted-foreground relative z-10 px-2">
          Or
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
    </div>
  );
};

export default SignupForm;
