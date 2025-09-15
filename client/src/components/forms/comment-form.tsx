"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useAppSelector } from "@/hooks/useAppSelector";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  content: z
    .string()
    .min(1, "Reply cannot be empty")
    .max(400, "Reply is too long"),
});

type FormData = z.infer<typeof formSchema>;

const CommentForm = () => {
  const user = useAppSelector((state) => state.auth.user);
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

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;
  const content = watch("content");

  // Handle content editable changes
  const handleContentChange = () => {
    if (contentEditableRef.current) {
      const text = contentEditableRef.current.textContent || "";
      setValue("content", text, { shouldValidate: true });

      // Auto-expand when user starts typing
      if (text.length > 0 && !isExpanded) {
        setIsExpanded(true);
      }
    }
  };

  // Handle paste events to maintain plain text
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  // Handle Enter key for submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  // Focus management
  const handleFocus = () => {
    setIsExpanded(true);
  };

  // Sync form value with contentEditable
  useEffect(() => {
    if (
      contentEditableRef.current &&
      contentEditableRef.current.textContent !== content
    ) {
      contentEditableRef.current.textContent = content;
    }
  }, [content]);

  const onSubmit = (data: FormData) => {
    console.log("Reply submitted:", data);
    toast.success("Reply posted!", {
      description: "Your reply has been submitted successfully.",
    });

    // Reset form
    setValue("content", "");
    if (contentEditableRef.current) {
      contentEditableRef.current.textContent = "";
    }
    setIsExpanded(false);
  };

  return (
    <div className="w-full border border-border rounded-lg bg-card">
      {/* Reply header */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm text-muted-foreground">
          Replying to <span className="text-primary">@Sakhisoliloquy</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-secondary/30">
          <div className="flex gap-3">
            {/* Avatar */}
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={user?.pfpPath} alt={userInitials} />
              <AvatarFallback>userInitials</AvatarFallback>
            </Avatar>

            {/* Content area */}
            <div className="w-full flex-1 min-w-0">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div
                        ref={contentEditableRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleContentChange}
                        onPaste={handlePaste}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        className={cn(
                          "w-full min-h-[60px] p-3 text-lg placeholder:text-muted-foreground",
                          "focus:outline-none resize-none",
                          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground",
                          errors.content && "border-destructive"
                        )}
                        data-placeholder="Post your reply"
                        role="textbox"
                        aria-multiline="true"
                        aria-label="Reply content"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Error message */}
              {errors.content && (
                <p className="text-sm text-destructive mt-1">
                  {errors.content.message}
                </p>
              )}

              {/* Expanded toolbar and actions */}
              {isExpanded && (
                <div className="mt-4 flex justify-end">
                  {/* Character count and submit */}
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-sm",
                        content.length > 260
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
                      Reply
                    </Button>
                  </div>
                </div>
              )}

              {/* Collapsed state submit button */}
              {!isExpanded && content.trim() && (
                <div className="mt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={!content.trim() || content.length > 280}
                    className="px-6"
                  >
                    Reply
                  </Button>
                </div>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CommentForm;
