import { useLazyQuery, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Command, MailPlusIcon, PopcornIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FORGOT_PASSWORD } from "@/gql-calls/queries";
import { cn } from "@/lib/utils";

import { Alert, AlertTitle } from "../ui/alert";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  email: z.string({ required_error: "Email cannot be empty." }).email(),
});

const ForgotPasswordForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [forgotPassword, { error, loading }] = useLazyQuery(FORGOT_PASSWORD);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data } = await forgotPassword({
        variables: {
          email: values.email.trim(),
        },
        fetchPolicy: "network-only",
      });

      if (data?.forgotPassword) {
        setEmailSent(true);
        form.reset();
      }
    } catch (error) {
      toast.error("Could not send the recovery link.", {
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
      {!emailSent && (
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
                      <FormDescription>
                        Please enter the email address associated with your
                        account.
                      </FormDescription>
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
              {error && (
                <p className="text-sm text-red-700">{error?.message}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Request Password Reset"}
              </Button>
            </div>
          </form>
        </Form>
      )}
      {emailSent && (
        <Alert className="border-green-600 text-green-700" variant="default">
          <MailPlusIcon />
          <AlertTitle>
            We have sent password reset instructions to the email if it exists.
          </AlertTitle>
        </Alert>
      )}
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

export default ForgotPasswordForm;
