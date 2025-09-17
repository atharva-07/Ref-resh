import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EDIT_COMMENT, EDIT_POST } from "@/gql-calls/mutation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";

interface EditCommentFormSheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  commentId: string;
  content: string;
}

type EditCommentFormProps = Pick<
  EditCommentFormSheetProps,
  "commentId" | "content"
> & {
  onSubmissionComplete: () => void;
};

const FormSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Comment content cannot be empty." })
    .max(400, {
      message: "Content length cannot be more than 500 characters.",
    }),
});

const EditCommentForm = forwardRef<
  { submitForm: () => Promise<void> },
  EditCommentFormProps
>(({ commentId, content, onSubmissionComplete }, ref) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: content,
    },
  });

  const [editComment, { error }] = useMutation(EDIT_COMMENT);

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      await form.handleSubmit(onSubmit)();
    },
  }));

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    try {
      const { data } = await editComment({
        variables: {
          commentId,
          content: values.content.trim(),
        },
      });

      if (data?.editComment) {
        toast.success("Comment edited.", {
          description: "Your comment was successfully edited.",
        });
        form.reset();
        if (onSubmissionComplete) {
          onSubmissionComplete();
        }
      }
    } catch (error) {
      toast.error("Error editing comment.", {
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
        {error && <p className="text-sm text-red-700">{error?.message}</p>}
      </form>
    </Form>
  );
});

const EditCommentFormSheet = ({
  open,
  onOpenChange,
  commentId,
  content,
}: EditCommentFormSheetProps) => {
  const editCommentFormRef = useRef<{ submitForm: () => Promise<void> }>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleEditComment = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (editCommentFormRef.current && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await editCommentFormRef.current.submitForm();
      } catch (error) {
        console.error("Error submitting edit comment form: ", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Comment</SheetTitle>
          <SheetDescription>You can edit your comment here.</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <EditCommentForm
            commentId={commentId}
            content={content}
            ref={editCommentFormRef}
            onSubmissionComplete={() => {
              onOpenChange(false);
              setIsSubmitting(false);
            }}
          />
        </div>
        <SheetFooter>
          <Button type="submit" onClick={handleEditComment}>
            {isSubmitting ? "Submitting..." : "Save"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditCommentFormSheet;
