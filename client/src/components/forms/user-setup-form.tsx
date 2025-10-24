import { useMutation, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

import { UPDATE_USER_INFO } from "@/gql-calls/mutation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import useMe from "@/hooks/useMe";
import { authActions } from "@/store/auth-slice";
import { Gender } from "@/types/User";

import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import Calendar13 from "../ui/calendar-13";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface UserSetupFormProps {
  onSubmissionComplete: () => void;
}

const UserSetupForm = forwardRef<
  { submitForm: () => Promise<void> },
  UserSetupFormProps
>(({ onSubmissionComplete }, ref) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, refetch } = useMe();

  const createFormSchema = () => {
    const baseSchema = z.object({
      username: z
        .string()
        .min(1, { message: "Username content cannot be empty." })
        .max(18, { message: "Username cannot have more than 18 characters." })
        .regex(/^[a-z_][a-z0-9_.]{5,17}$/g, {
          message:
            "Username can only have lowercase characters, numbers, underscore and dot. It can only start with lowercase characters or underscore.",
        }),
    });

    const extendedSchema = baseSchema.extend({
      ...(!user?.gender && {
        gender: z.enum(["MALE", "FEMALE", "OTHER"], {
          required_error: "You need to select a gender.",
        }),
      }),
      ...(!user?.dob && {
        dateofbirth: z.date({
          required_error: "Date of Birth cannot be empty.",
        }),
      }),
    });

    return extendedSchema;
  };

  const formSchema = createFormSchema();

  const [updateUserInfo, { error: updateError }] = useMutation(
    UPDATE_USER_INFO,
    {
      onCompleted: () => {
        refetch().then(() => {
          navigate("/", { replace: true });
        });
      },
    }
  );

  const dob = user?.dob ? new Date(parseInt(user.dob)) : undefined;
  if (dob) {
    dob.setDate(dob.getDate() - 1);
  }

  const form = useForm<z.infer<ReturnType<typeof createFormSchema>>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      gender: user?.gender || Gender.MALE,
      dateofbirth: dob || new Date(),
    },
  });

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      await form.handleSubmit(onSubmit)();
    },
  }));

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userInfoData: any = {
        userName: values.username,
      };

      if (!user?.gender) {
        userInfoData.gender = values.gender;
      }
      if (!user?.dob) {
        userInfoData.dob = new Date(
          (values.dateofbirth as Date).setDate(
            (values.dateofbirth as Date).getDate() + 1
          )
        )
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "/");
      }

      const { data } = await updateUserInfo({
        variables: {
          userInfoData,
        },
      });

      if (data?.updateUserInfo) {
        dispatch(
          authActions.setUser({
            userId: data.updateUserInfo._id,
            fullName:
              data.updateUserInfo.firstName +
              " " +
              data.updateUserInfo.lastName,
            username: data.updateUserInfo.userName,
            pfpPath: data.updateUserInfo.pfpPath,
          })
        );
        form.reset();
        if (onSubmissionComplete) {
          onSubmissionComplete();
        }
        navigate("/", {
          replace: true,
        });
      }
    } catch (error) {
      toast.error("Error updating user information.", {
        description: "Please try again later.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        {!user?.gender && !user?.dob && (
          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="gender"
              disabled={!!user?.gender}
              render={({ field }) => (
                <div className="grid gap-3">
                  <FormItem className="space-y-3">
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value as string}
                        className="flex flex-col"
                      >
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem
                              id="male"
                              className="hover:cursor-pointer"
                              value={Gender.MALE}
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="male"
                            className="font-normal hover:cursor-pointer"
                          >
                            Male
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem
                              id="female"
                              className="hover:cursor-pointer"
                              value={Gender.FEMALE}
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="female"
                            className="font-normal hover:cursor-pointer"
                          >
                            Female
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem
                              id="other"
                              className="hover:cursor-pointer"
                              value={Gender.OTHER}
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="other"
                            className="font-normal hover:cursor-pointer"
                          >
                            Non-Binary
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="dateofbirth"
              disabled={!!user?.dob}
              render={({ field }) => (
                <div className="grid gap-3">
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value as Date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar13
                          selected={field.value! as Date}
                          onSelect={field.onChange}
                          disabled={(date: Date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />
          </div>
        )}
        {updateError && (
          <p className="text-sm text-red-700">{updateError?.message}</p>
        )}
      </form>
    </Form>
  );
});

export default UserSetupForm;
