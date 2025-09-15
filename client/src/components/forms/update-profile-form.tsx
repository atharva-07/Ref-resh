"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosResponse } from "axios";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

import { UPDATE_USER_INFO } from "@/gql-calls/mutation";
import { GET_USER_PROFILE } from "@/gql-calls/queries";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { authActions } from "@/store/auth-slice";
import {
  BANNER_MAX_SIZE_IN_BYTES,
  PFP_MAX_SIZE_IN_BYTES,
} from "@/utility/constants";
import { validateImageFile } from "@/utility/utility-functions";
import { ACCEPTED_IMAGE_TYPES } from "@/utility/utility-types";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  firstname: z
    .string()
    .max(26, { message: "First Name cannot have more than 26 characters." })
    .optional(),
  lastname: z
    .string()
    .max(26, { message: "Last Name cannot have more than 26 characters." })
    .optional(),
  username: z
    .string()
    .max(36, { message: "Username cannot have more than 36 characters." })
    .optional(),
  bio: z
    .string()
    .max(80, {
      message: "Bio must not be longer than 80 characters.",
    })
    .optional(),
  pfpPath: z
    .instanceof(File, { message: "Profile picture must be an image file." })
    .optional()
    .superRefine((file, ctx) => {
      const errors = validateImageFile(file, PFP_MAX_SIZE_IN_BYTES);
      errors.forEach((err) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err,
        });
      });
    }),
  bannerPath: z
    .instanceof(File, { message: "Banner must be an image file." })
    .optional()
    .superRefine((file, ctx) => {
      const errors = validateImageFile(file, BANNER_MAX_SIZE_IN_BYTES);
      errors.forEach((err) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err,
        });
      });
    }),
});

interface UpdateProfileFormProps {
  user: {
    firstname: string;
    lastname: string;
    username: string;
    bio: string;
  };
  onSubmissionComplete: () => void;
}

const UpdateProfileForm = forwardRef<
  { submitForm: () => void },
  UpdateProfileFormProps
>(({ user, onSubmissionComplete }, ref) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      bio: user.bio || "",
      pfpPath: undefined,
      bannerPath: undefined,
    },
  });

  const [updateUserInfo, { error, loading }] = useMutation(UPDATE_USER_INFO);

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      await form.handleSubmit(onSubmit)();
    },
  }));

  const { isDirty, dirtyFields } = form.formState;

  const payload = {
    firstName: dirtyFields.firstname && form.getValues("firstname")?.trim(),
    lastName: dirtyFields.lastname && form.getValues("lastname")?.trim(),
    userName: dirtyFields.username && form.getValues("username")?.trim(),
    bio: dirtyFields.bio && form.getValues("bio")?.trim(),
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let resolverData;
    try {
      const formData = new FormData();
      if (values.pfpPath) {
        formData.append("pfpPath", values.pfpPath);
      }
      if (values.bannerPath) {
        formData.append("bannerPath", values.bannerPath);
      }

      let response: AxiosResponse<{
        pfpUrl: string;
        bannerUrl: string;
      }>;
      if (dirtyFields.pfpPath || dirtyFields.bannerPath) {
        response = await axios.post(
          `${import.meta.env.VITE_NODE_SERVER_URI}/upload/profile`,
          formData,
          {
            withCredentials: true,
          }
        );
        if (response.status !== 200) {
          throw new Error("File Upload Failed.");
        }

        const { data } = await updateUserInfo({
          variables: {
            userProfileData: {
              ...payload,
              pfpPath: dirtyFields.pfpPath && response.data.pfpUrl,
              bannerPath: dirtyFields.bannerPath && response.data.bannerUrl,
            },
          },
          update: (cache, { data: mutationResult }) => {
            const newProfile = mutationResult.updateUserInfo;
            cache.modify({
              fields: {
                fetchUserProfile() {
                  return { ...newProfile };
                },
              },
            });
          },
        });

        resolverData = data;
      } else {
        const { data } = await updateUserInfo({
          variables: {
            userProfileData: {
              ...payload,
            },
          },
          update: (cache, { data: mutationResult }) => {
            const newProfile = mutationResult.updateUserInfo;
            cache.modify({
              fields: {
                fetchUserProfile() {
                  return { ...newProfile };
                },
              },
            });
          },
        });

        resolverData = data;
      }

      if (resolverData.updateUserInfo) {
        toast.success("Profile updated", {
          description: "Your changes have been saved.",
        });
        dispatch(
          authActions.setUser({
            userId: resolverData.updateUserInfo._id,
            fullName:
              resolverData.updateUserInfo.firstName +
              " " +
              resolverData.updateUserInfo.lastName,
            username: resolverData.updateUserInfo.userName,
            pfpPath: resolverData.updateUserInfo.pfpPath,
          })
        );
        form.reset();
        if (onSubmissionComplete) {
          onSubmissionComplete();
        }
        navigate(`/${resolverData.updateUserInfo.userName}`);
      }
    } catch (error) {
      toast.error("Error updating profile info.", {
        description: "Please try again later.",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        encType="multipart/form-data"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid gap-2 md:grid-cols-3">
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <div className="grid gap-2">
                <FormItem>
                  <FormLabel htmlFor="firstname">First Name</FormLabel>
                  <FormControl>
                    <Input
                      id="firstname"
                      type="text"
                      placeholder="Enter your first name"
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
            name="lastname"
            render={({ field }) => (
              <div className="grid gap-2">
                <FormItem>
                  <FormLabel htmlFor="lastname">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      id="lastname"
                      type="text"
                      placeholder="Enter your last name"
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
            name="username"
            render={({ field }) => (
              <div className="grid gap-2">
                <FormItem>
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <FormControl>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <div className="grid gap-2">
              <FormItem>
                <FormLabel htmlFor="lastname">Bio</FormLabel>
                <FormControl>
                  <Textarea
                    id="bio"
                    className="min-h-24"
                    placeholder="Tell the world about you"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>
          )}
        />

        <div className="grid gap-2 md:grid-cols-2">
          <FormField
            control={form.control}
            name="pfpPath"
            render={({ field: { value, onChange, ...field } }) => (
              <div className="grid gap-2">
                <FormItem>
                  <FormLabel htmlFor="pfpPath">Profile Picture</FormLabel>
                  <FormControl>
                    <Input
                      id="pfpPath"
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
                    Profile picture must be less than 2MB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="bannerPath"
            render={({ field: { value, onChange, ...field } }) => (
              <div className="grid gap-2">
                <FormItem>
                  <FormLabel htmlFor="bannerPath">Banner Picture</FormLabel>
                  <FormControl>
                    <Input
                      id="bannerPath"
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
                    Banner picture must be less than 5MB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </div>
            )}
          />
        </div>
        {error && <p className="text-sm text-red-700">{error?.message}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
});

export default UpdateProfileForm;
