import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosResponse } from "axios";
import { ImageIcon, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
import { CREATE_POST } from "@/gql-calls/mutation";
import { GET_USER_POSTS } from "@/gql-calls/queries";
import { useAppSelector } from "@/hooks/useAppSelector";
import { cn } from "@/lib/utils";
import { FEED_PAGE_SIZE, POST_MAX_SIZE_IN_BYTES } from "@/utility/constants";
import { validateImageFile } from "@/utility/utility-functions";
import { ACCEPTED_IMAGE_TYPES } from "@/utility/utility-types";

const MAX_CHARACTERS = 500;

const FormSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Post content cannot be empty." })
    .max(500, {
      message: "Content length cannot be more than 500 characters.",
    }),
  images: z
    .instanceof(FileList, { message: "Can only choose image file(s)." })
    .optional()
    .superRefine((files, ctx) => {
      if (files) {
        const errors: string[] = [];
        if (files.length > 4) {
          errors.push("Cannot post more than 4 images at once.");
        }
        const filesCount = files.length;
        for (let i = 0; i < filesCount; ++i) {
          const file = files.item(i);
          if (file) {
            const error = validateImageFile(file, POST_MAX_SIZE_IN_BYTES);
            errors.push(...error);
          }
        }
        errors.forEach((err) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: err,
          });
        });
      }
    }),
});

const PostComposer = () => {
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const userInitials: string =
    user!.fullName.split(" ")[0][0] + user!.fullName.split(" ")[1][0];

  const [images, setImages] = useState<string[]>([]);
  const [charCount, setCharCount] = useState(0);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: "",
      images: undefined,
    },
  });

  const handleInput = () => {
    if (contentEditableRef.current) {
      const content = contentEditableRef.current.innerText;
      setCharCount(content.length);
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
      form.handleSubmit(onSubmit)();
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const [createPost, { error, loading }] = useMutation(CREATE_POST);

  const { dirtyFields } = form.formState;

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    let resolverData;
    try {
      const formData = new FormData();
      if (values.content) {
        formData.append("content", values.content);
      }
      if (values.images) {
        Array.from(values.images).forEach((file) => {
          formData.append("images", file);
        });
      }

      let response: AxiosResponse<{
        imagesUrls: string[];
      }>;
      if (dirtyFields.images) {
        response = await axios.post(
          `${import.meta.env.VITE_NODE_SERVER_URI}/upload/post`,
          formData,
          {
            withCredentials: true,
          }
        );
        if (response.status !== 200) {
          throw new Error("File Upload Failed.");
        }

        const { data } = await createPost({
          variables: {
            postData: {
              content: values.content.trim(),
              images: response.data.imagesUrls,
            },
          },
          refetchQueries: [
            {
              query: GET_USER_POSTS,
              variables: {
                userName: user!.username,
                pageSize: FEED_PAGE_SIZE,
              },
            },
          ],
        });

        resolverData = data;
      } else {
        const { data } = await createPost({
          variables: {
            postData: {
              content: values.content.trim(),
            },
          },
          refetchQueries: [
            {
              query: GET_USER_POSTS,
              variables: {
                userName: user!.username,
                pageSize: FEED_PAGE_SIZE,
              },
            },
          ],
        });

        resolverData = data;
      }

      if (resolverData?.createPost) {
        toast.success("Post created.", {
          description: "Your post was successfully published.",
        });
        form.reset();
        navigate(`/${resolverData.createPost.author.userName}`);
      }
    } catch (error) {
      toast.error("Error creating post.", {
        description: "Please try again later.",
      });
    }
  }

  const isOverLimit = charCount > MAX_CHARACTERS;
  const progress = (charCount / MAX_CHARACTERS) * 100;

  return (
    <div className="w-full border border-border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={user?.pfpPath} alt={userInitials} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
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
                          onInput={(e) => {
                            handleInput();
                            field.onChange(e.currentTarget.innerText);
                          }}
                          onPaste={handlePaste}
                          onKeyDown={handleKeyDown}
                          className={cn(
                            "min-h-[60px] text-xl outline-none text-foreground",
                            "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground",
                            "break-words break-all"
                          )}
                          data-placeholder="What's on your mind?"
                          role="textbox"
                          aria-multiline="true"
                          aria-label="Post content"
                          {...field}
                          ref={contentEditableRef}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {images.length > 0 && (
                  <div className="mt-3">
                    {images.length === 1 && (
                      <div className="relative rounded-2xl overflow-hidden border border-border">
                        <img
                          src={images[0]}
                          alt="Image 1"
                          className="w-full h-auto max-h-[500px] object-cover"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/75 hover:bg-black/90 text-white"
                          onClick={() => removeImage(0)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {images.length === 2 && (
                      <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-border">
                        {images.map((img, index: number) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={img}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/75 hover:bg-black/90 text-white"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {images.length > 2 && (
                      <Carousel className="w-full">
                        <CarouselContent>
                          {images.map((img, index) => (
                            <CarouselItem key={index}>
                              <AspectRatio ratio={16 / 9}>
                                <div className="relative rounded-2xl overflow-hidden border border-border">
                                  <img
                                    src={img}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-auto max-h-[500px] object-cover"
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/75 hover:bg-black/90 text-white"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </AspectRatio>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </Carousel>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-t border-border">
            <div className="flex items-center gap-1">
              <FormField
                control={form.control}
                name="images"
                render={({ field: { value, onChange, ...field } }) => (
                  <div className="grid gap-2">
                    <FormItem>
                      <FormControl>
                        <Input
                          id="images"
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES.join(",")}
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = e.target.files;
                            onChange(files);

                            if (files && files.length > 0) {
                              const isValid = await form.trigger("images");

                              if (isValid) {
                                const newImages: string[] = [];
                                const fileArray = Array.from(files);

                                await Promise.all(
                                  fileArray.map(
                                    (file) =>
                                      new Promise<void>((resolve) => {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          if (event.target?.result) {
                                            newImages.push(
                                              event.target.result as string
                                            );
                                          }
                                          resolve();
                                        };
                                        reader.readAsDataURL(file);
                                      })
                                  )
                                );
                                setImages(newImages);
                              } else {
                                setImages([]);
                              }
                            } else {
                              setImages([]);
                              onChange(undefined);
                            }
                          }}
                          {...field}
                          ref={fileInputRef}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-primary hover:bg-primary/10"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              />
            </div>

            <div className="flex items-center gap-3">
              {charCount > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="stroke-muted"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className={cn(
                        "stroke-primary transition-all",
                        isOverLimit && "stroke-destructive"
                      )}
                      strokeWidth="3"
                      strokeDasharray={`${Math.min(progress, 100)} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {charCount > MAX_CHARACTERS - 20 && (
                    <span
                      className={cn(
                        "text-sm",
                        isOverLimit
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {MAX_CHARACTERS - charCount}
                    </span>
                  )}
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive-foreground">
                  {error?.message}
                </p>
              )}

              <div className="h-6 w-px bg-border" />

              <Button
                type="submit"
                size="sm"
                className="rounded-full px-4 font-bold"
                disabled={charCount === 0 || isOverLimit}
              >
                {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PostComposer;
