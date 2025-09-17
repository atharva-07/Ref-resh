"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosResponse } from "axios";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { CREATE_POST } from "@/gql-calls/mutation";
import { GET_USER_POSTS } from "@/gql-calls/queries";
import { useAppSelector } from "@/hooks/useAppSelector";
import { FEED_PAGE_SIZE, POST_MAX_SIZE_IN_BYTES } from "@/utility/constants";
import { validateImageFile } from "@/utility/utility-functions";
import { ACCEPTED_IMAGE_TYPES } from "@/utility/utility-types";

import { Input } from "../ui/input";

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

interface PostFormProps {
  onSubmissionComplete: () => void;
}

const PostForm = forwardRef<{ submitForm: () => Promise<void> }, PostFormProps>(
  ({ onSubmissionComplete }, ref) => {
    const user = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        content: "",
        images: undefined,
      },
    });

    const [createPost, { error }] = useMutation(CREATE_POST);

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        await form.handleSubmit(onSubmit)();
      },
    }));

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
          if (onSubmissionComplete) {
            onSubmissionComplete();
          }
          navigate(`/${resolverData.createPost.author.userName}`);
        }
      } catch (error) {
        toast.error("Error creating post.", {
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

          <FormField
            control={form.control}
            name="images"
            render={({ field: { value, onChange, ...field } }) => (
              <div className="grid gap-2">
                <FormItem>
                  <FormLabel htmlFor="images">Images</FormLabel>
                  <FormControl>
                    <Input
                      id="images"
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        onChange(files);
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Picture must be less than 4MB.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </div>
            )}
          />
          {error && <p className="text-sm text-red-700">{error?.message}</p>}
        </form>
      </Form>
    );
  }
);

export default PostForm;
