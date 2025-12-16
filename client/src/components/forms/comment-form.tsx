import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { CREATE_COMMENT } from "@/gql-calls/mutation";

const FormSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Comment content cannot be empty." })
    .max(400, {
      message: "Content length cannot be more than 500 characters.",
    }),
});

interface CommentFormProps {
  postId: string;
  parentCommentId: string | null;
  onSubmissionComplete: () => void;
}

const CommentForm = forwardRef<
  { submitForm: () => Promise<void> },
  CommentFormProps
>(({ onSubmissionComplete, postId, parentCommentId }, ref) => {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: "",
    },
  });

  const [postComment, { error }] = useMutation(CREATE_COMMENT);

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      await form.handleSubmit(onSubmit)();
    },
  }));

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    try {
      const { data } = await postComment({
        variables: {
          commentData: {
            content: values.content.trim(),
            postId: postId,
            parentCommentId: parentCommentId,
          },
        },
      });

      if (data?.postComment) {
        toast.success("Comment posted.", {
          description: "Your comment was successfully published.",
        });
        form.reset();
        if (onSubmissionComplete) {
          onSubmissionComplete();
        }
        navigate(`/comment/${data.postComment._id}`);
      }
    } catch (error) {
      toast.error("Error posting comment.", {
        description: "Please try again later.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <div className="grid gap-2">
              <FormItem>
                <FormLabel htmlFor="content">Content</FormLabel>
                <FormControl>
                  <Textarea
                    id="content"
                    className="min-h-24"
                    placeholder="What's on your mind?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>
          )}
        />
        {error && (
          <p className="text-sm text-destructive-foreground">
            {error?.message}
          </p>
        )}
      </form>
    </Form>
  );
});

export default CommentForm;
