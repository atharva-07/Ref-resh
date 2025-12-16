import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";
import { Send, SendHorizonal } from "lucide-react";
import { useRef } from "react";
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
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useSocket } from "@/hooks/useSocket";
import { chatActions } from "@/store/chat-slice";

const formSchema = z.object({
  message: z.string({ required_error: "Message cannot be empty." }).max(400),
});

const ChatForm = ({ chatId }: { chatId: string }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const { user } = useAppSelector((state) => state.auth);

  const socket = useSocket();

  // A debounced function to emit the "setTyping" event
  const isTypingRef = useRef(false);

  // The debounced function to handle both typing and stopping
  const handleTyping = debounce(() => {
    // If we've already sent the 'typing start' event,
    // we should now send the 'stop typing' event.
    if (isTypingRef.current) {
      if (!socket || !chatId) return; // Ensure chatId is defined
      socket.emit("stopTyping", { chatId, username: user!.username });
      isTypingRef.current = false;
    }
  }, 2000); // 2-second delay after the last keystroke

  const handleInputChange = () => {
    // If the user wasn't typing before, emit the 'typing start' event
    // immediately on the first keystroke.
    if (!isTypingRef.current) {
      if (!socket || !chatId) return;
      socket.emit("startTyping", { chatId, username: user!.username });
      isTypingRef.current = true;
    }
    // Now, call the debounced function. This resets the timer
    // on every subsequent keystroke.
    handleTyping();
  };

  const dispatch = useAppDispatch();

  const [sendMessage, { error, loading }] = useMutation(SEND_MESSAGE);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data } = await sendMessage({
        variables: {
          messageData: {
            chatId: chatId,
            content: values.message.trim(),
          },
        },
        // fetchPolicy: "network-only",
      });

      if (data.sendChatMessage) {
        form.reset();
        dispatch(chatActions.messageSent({ message: data.sendChatMessage }));
      }
    } catch (err) {
      /* empty */
      console.log(err);
    } // TODO: Is something even required here?
  }

  return (
    <div className="p-2 border flex-shrink-0 sticky">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="grow">
                <FormControl>
                  <Input
                    placeholder="Enter your message..."
                    autoComplete="off"
                    className="flex-1"
                    onInput={handleInputChange}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="icon" disabled={loading}>
            <Send />
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ChatForm;
