import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosResponse } from "axios";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
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
import { CREATE_STORY } from "@/gql-calls/mutation";
import { STORY_MAX_SIZE_IN_BYTES } from "@/utility/constants";
import { validateImageFile } from "@/utility/utility-functions";
import { ACCEPTED_IMAGE_TYPES } from "@/utility/utility-types";

import { Input } from "../ui/input";

const FormSchema = z.object({
  caption: z
    .string()
    .max(200, {
      message: "Caption length cannot be more than 200 characters.",
    })
    .optional(),
  image: z
    .instanceof(File, { message: "Story image must be an image file." })
    .optional()
    .superRefine((file, ctx) => {
      const errors = validateImageFile(file, STORY_MAX_SIZE_IN_BYTES);
      errors.forEach((err) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err,
        });
      });
    }),
});

interface StoryFormProps {
  onSubmissionComplete: () => void;
}

const StoryForm = forwardRef<
  { submitForm: () => Promise<void> },
  StoryFormProps
>(({ onSubmissionComplete }, ref) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      caption: "",
      image: undefined,
    },
  });

  const [createStory, { error }] = useMutation(CREATE_STORY);

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
      if (values.caption) {
        formData.append("caption", values.caption);
      }
      if (values.image) {
        formData.append("image", values.image);
      }

      let response: AxiosResponse<{
        imageUrl: string;
      }>;
      if (dirtyFields.image) {
        response = await axios.post(
          `${import.meta.env.VITE_NODE_SERVER_URI}/upload/story`,
          formData,
          {
            withCredentials: true,
          }
        );
        if (response.status !== 200) {
          throw new Error("File Upload Failed.");
        }

        const { data } = await createStory({
          variables: {
            storyData: {
              caption: values.caption && values.caption.trim(),
              image: response.data.imageUrl,
            },
          },
        });

        resolverData = data;
      } else {
        const { data } = await createStory({
          variables: {
            storyData: {
              caption: values.caption && values.caption.trim(),
            },
          },
        });

        resolverData = data;
      }

      if (resolverData?.createStory) {
        toast.success("Story created.", {
          description: "Your story was successfully published.",
        });
        form.reset();
        if (onSubmissionComplete) {
          onSubmissionComplete();
        }
      }
    } catch (error) {
      toast.error("Error creating story.", {
        description: "Please try again later.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <div className="grid gap-2">
              <FormItem>
                <FormLabel htmlFor="caption">Caption</FormLabel>
                <FormControl>
                  <Textarea
                    id="caption"
                    className="min-h-24"
                    placeholder="What's popping?"
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
          name="image"
          render={({ field: { value, onChange, ...field } }) => (
            <div className="grid gap-2">
              <FormItem>
                <FormLabel htmlFor="image">Image</FormLabel>
                <FormControl>
                  <Input
                    id="image"
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                    }}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Image must be less than 4MB.
                </FormDescription>
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

export default StoryForm;
