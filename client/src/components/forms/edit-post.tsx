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
import { EDIT_POST } from "@/gql-calls/mutation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";

interface EditPostFormSheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  postId: string;
  content: string;
}

type EditPostFormProps = Pick<EditPostFormSheetProps, "postId" | "content"> & {
  onSubmissionComplete: () => void;
};

const FormSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Post content cannot be empty." })
    .max(500, {
      message: "Content length cannot be more than 500 characters.",
    }),
});

const EditPostForm = forwardRef<
  { submitForm: () => Promise<void> },
  EditPostFormProps
>(({ postId, content, onSubmissionComplete }, ref) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: content,
    },
  });

  const [editPost, { error }] = useMutation(EDIT_POST);

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      await form.handleSubmit(onSubmit)();
    },
  }));

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    try {
      const { data } = await editPost({
        variables: {
          postId,
          content: values.content.trim(),
        },
      });

      if (data?.editPost) {
        toast.success("Post edited.", {
          description: "Your post was successfully edited.",
        });
        form.reset();
        if (onSubmissionComplete) {
          onSubmissionComplete();
        }
      }
    } catch (error) {
      toast.error("Error editing post.", {
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

const EditPostFormSheet = ({
  open,
  onOpenChange,
  postId,
  content,
}: EditPostFormSheetProps) => {
  const editPostFormRef = useRef<{ submitForm: () => Promise<void> }>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleEditPost = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (editPostFormRef.current && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await editPostFormRef.current.submitForm();
      } catch (error) {
        console.error("Error submitting new post form: ", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Post</SheetTitle>
          <SheetDescription>
            You can change the caption of the post.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <EditPostForm
            postId={postId}
            content={content}
            ref={editPostFormRef}
            onSubmissionComplete={() => {
              onOpenChange(false);
              setIsSubmitting(false);
            }}
          />
        </div>
        <SheetFooter>
          <Button type="submit" onClick={handleEditPost}>
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

export default EditPostFormSheet;
