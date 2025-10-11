"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CREATE_COMMENT } from "@/gql-calls/mutation";
import { useAppSelector } from "@/hooks/useAppSelector";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(400, "Comment is too long."),
});

type FormData = z.infer<typeof formSchema>;

const CommentComposer = ({
  mode,
  postId,
  parentCommentId,
}: {
  mode: "post" | "comment";
  postId: string | null;
  parentCommentId: string | null;
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const userInitials: string =
    user!.fullName.split(" ")[0][0] + user!.fullName.split(" ")[1][0];

  const [isExpanded, setIsExpanded] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const { watch, setValue, handleSubmit } = form;
  const content = watch("content");

  const [postComment, { error, loading }] = useMutation(CREATE_COMMENT);

  const handleContentChange = () => {
    if (contentEditableRef.current) {
      const text = contentEditableRef.current.textContent || "";
      setValue("content", text, { shouldValidate: true });

      if (text.length > 0 && !isExpanded) {
        setIsExpanded(true);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  useEffect(() => {
    if (
      contentEditableRef.current &&
      contentEditableRef.current.textContent !== content
    ) {
      contentEditableRef.current.textContent = content;
    }
  }, [content]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
        setValue("content", "");
        if (contentEditableRef.current) {
          contentEditableRef.current.textContent = "";
        }
        setIsExpanded(false);
        navigate(`/comment/${data.postComment._id}`);
      }
    } catch (error) {
      toast.error("Error posting comment.", {
        description: "Please try again later.",
      });
    }
  }

  return (
    <div className="w-full border bg-secondary/30">
      {isExpanded && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm text-muted-foreground">
            {mode === "post"
              ? "Commenting on the above post."
              : "Replying to the comment above."}
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={user?.pfpPath} alt={userInitials} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>

            <div className="w-full flex-1 min-w-0">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div
                        id="content"
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleContentChange}
                        onPaste={handlePaste}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        className={cn(
                          "w-full max-w-full min-h-[60px] p-3 text-base placeholder:text-muted-foreground",
                          "focus:outline-none resize-none",
                          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground",
                          "break-words break-all",
                          error && "border-destructive"
                        )}
                        data-placeholder="What's on your mind?"
                        role="textbox"
                        aria-multiline="true"
                        aria-label="Comment content"
                        {...field}
                        ref={contentEditableRef}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-sm text-destructive mt-1">
                  {error?.message}
                </p>
              )}

              {isExpanded && (
                <div className="mt-4 flex justify-end">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-sm",
                        content.length > 350
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {content.length}/400
                    </span>
                    <Button
                      type="submit"
                      disabled={!content.trim() || content.length > 400}
                      className="px-6"
                    >
                      {loading ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CommentComposer;
