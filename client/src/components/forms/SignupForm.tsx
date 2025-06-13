"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
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
    dateOfBirth: z.date({ required_error: "Date of Birth cannot be empty." }),
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
    confirmPassword: z.string({
      required_error: "Re-entered Password cannot be empty.",
    }),
    authType: z.enum(["EMAIL", "GOOGLE", "FACEBOOK"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

const SignupForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      gender: "MALE",
      dateOfBirth: new Date(),
      password: "",
      confirmPassword: "",
      authType: "EMAIL",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-[40rem] child:mb-5"
      >
        <div className="flex gap-6 child:w-[18rem]">
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex gap-6">
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          className="hover:cursor-pointer"
                          value="MALE"
                        />
                      </FormControl>
                      <FormLabel className="font-normal hover:cursor-pointer">
                        Male
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          className="hover:cursor-pointer"
                          value="FEMALE"
                        />
                      </FormControl>
                      <FormLabel className="font-normal hover:cursor-pointer">
                        Female
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          className="hover:cursor-pointer"
                          value="OTHER"
                        />
                      </FormControl>
                      <FormLabel className="font-normal hover:cursor-pointer">
                        Non-Binary
                      </FormLabel>
                    </FormItem>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
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
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="Re-enter your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="submit" className="font-semibold">
            Signup
          </Button>
          <Link to="/login">
            <Button type="button" variant="secondary" className="font-light">
              Already have an account?&nbsp;Login.
            </Button>
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default SignupForm;
