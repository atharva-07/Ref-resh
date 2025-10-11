import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Command, MailPlusIcon, PopcornIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
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
import { CHANGE_PASSWORD } from "@/gql-calls/mutation";
import { cn } from "@/lib/utils";

import { Alert, AlertTitle } from "../ui/alert";
import { Separator } from "../ui/separator";

const formSchema = z
  .object({
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
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords don't match",
    path: ["confirmpassword"], // path of error
  });

const PasswordResetForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmpassword: "",
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const searchParamToken = new URLSearchParams(location.search).get("token");
  const [changePassword, { error, loading }] = useMutation(CHANGE_PASSWORD);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data } = await changePassword({
        variables: {
          passwordResetData: {
            token: searchParamToken,
            password: values.password,
            confirmPassword: values.confirmpassword,
          },
        },
        fetchPolicy: "network-only",
      });

      if (data?.changePassword) {
        toast.success("Password updated successfully.", {
          description: "You can now login with the new password.",
        });
        form.reset();
        navigate("/login");
      }
    } catch (error) {
      toast.error("Could not update password.", {
        description: "Please try again.",
      });
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <a href="#" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex size-8 items-center justify-center rounded-md">
            <Command className="size-6" />
          </div>
          <span className="sr-only">Refresh</span>
        </a>
        <h1 className="text-xl font-bold">Welcome to Ref-resh.</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
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
            {error && <p className="text-sm text-red-700">{error?.message}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </Form>
      <Separator />
      <div className="text-center text-sm">
        Want to login instead?{" "}
        <Link to="/login" className="underline underline-offset-4">
          Login.
        </Link>
      </div>
    </div>
  );
};

export default PasswordResetForm;
