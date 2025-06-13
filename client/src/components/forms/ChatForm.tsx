import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizonal } from "lucide-react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SEND_MESSAGE } from "@/gql-calls/mutation";

const formSchema = z.object({
  message: z.string({ required_error: "Message cannot be empty." }).max(400),
});

interface ChatFormProps {
  onSendMessage: (event: string, data: string) => void;
}

const ChatForm = ({ onSendMessage }: ChatFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const { chatId } = useParams();

  const [sendMessage, { error, loading }] = useMutation(SEND_MESSAGE);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.

    try {
      const { data } = await sendMessage({
        variables: {
          messageData: {
            chatId: chatId,
            content: form.getValues("message"),
          },
        },
        // fetchPolicy: "network-only",
      });

      if (data.sendChatMessage) {
        onSendMessage("newMessage", JSON.stringify(data.sendChatMessage));
        console.log("Message sent. Resetting form.", data.sendChatMessage);
        form.reset();
      }
    } catch (err) {
      /* empty */
      console.log(err);
    } // TODO: Is something even required here?
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex justify-between"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="grow">
              <FormControl>
                <Input
                  placeholder="Enter your message..."
                  autoComplete="off"
                  className="focus-visible:ring-offset-0 rounded-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="rounded-none" disabled={loading}>
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </form>
    </Form>
  );
};

export default ChatForm;
