"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { TOGGLE_ACCOUNT_TYPE } from "@/gql-calls/mutation";
import { GET_ACCOUNT_SETTINGS_DATA } from "@/gql-calls/queries";

const formSchema = z.object({
  privateAccount: z.boolean().default(false),
});

const AccountTypeForm = ({
  isPrivateAccount,
}: {
  isPrivateAccount: boolean;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      privateAccount: isPrivateAccount,
    },
  });

  const [toggleAccountType] = useMutation(TOGGLE_ACCOUNT_TYPE);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data } = await toggleAccountType();

      if (data?.toggleAccountType) {
        toast.success("Account type changed.", {
          description: `Your account is now ${data.toggleAccountType.updatedAccountType.toLowerCase()}.`,
        });
      }
    } catch (error) {
      toast.error(
        `Could not make account ${isPrivateAccount ? "public" : "private"}.`,
        {
          description: "Please try again later.",
        }
      );
    }
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-6">
        <FormField
          control={form.control}
          name="privateAccount"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div>
                <FormLabel>Private Account</FormLabel>
                <FormDescription>
                  Your posts, followers and following will only be visible to
                  your followers.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    form.handleSubmit(onSubmit)();
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default AccountTypeForm;
