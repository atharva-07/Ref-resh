import { useLazyQuery, useMutation, useSuspenseQuery } from "@apollo/client";
import { BadgeCheckIcon, ShieldAlertIcon } from "lucide-react";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

import AccountTypeForm from "@/components/forms/account-type-form";
import MainSpinner from "@/components/main/main-spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { BLOCK_UNBLOCK_USER, LOGOUT } from "@/gql-calls/mutation";
import {
  FORGOT_PASSWORD,
  GET_ACCOUNT_SETTINGS_DATA,
} from "@/gql-calls/queries";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { client } from "@/middlewares/auth";
import { authActions } from "@/store/auth-slice";
import { socketActions } from "@/store/middlewares/socket-middleware";
import { sseActions } from "@/store/middlewares/sse-middleware";

const Settings = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const { data } = useSuspenseQuery(GET_ACCOUNT_SETTINGS_DATA);
  const blockedAccounts = data?.fetchAccountSettingsData?.blockedAccounts || [];
  const privateAccount =
    data?.fetchAccountSettingsData?.privateAccount || false;
  const authType = data?.fetchAccountSettingsData?.authType;

  const [emailSent, setEmailSent] = useState<boolean>(false);

  const [unblockUser] = useMutation(BLOCK_UNBLOCK_USER);
  const [logout] = useMutation(LOGOUT);
  const [changePassword, { error, loading }] = useLazyQuery(FORGOT_PASSWORD, {
    fetchPolicy: "network-only",
  });

  const forceLogout = async () => {
    try {
      const { data } = await logout();
      if (data?.logout) {
        dispatch(authActions.logout());
        dispatch({ type: socketActions.disconnect });
        dispatch({ type: sseActions.disconnect });
        client.clearStore();
      }
    } catch (error) {
      toast.error("Could not logout.", {
        description: "Please try again.",
      });
    }
  };

  const handlePasswordChange = async () => {
    try {
      const { data } = await changePassword({
        variables: {
          userId: user!.userId,
        },
      });

      if (data?.forgotPassword) {
        setEmailSent(true);
        setTimeout(() => {
          setEmailSent(false);
          forceLogout();
        }, 10000);
      }
    } catch (error) {
      toast.error("Could not send email.", {
        description: "Please try again.",
      });
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      const { data } = await unblockUser({
        variables: {
          userId: userId,
        },
        refetchQueries: [GET_ACCOUNT_SETTINGS_DATA],
      });

      if (data?.blockOrUnblockUser.status === "UNBLOCKED") {
        toast.success(`${data.blockOrUnblockUser.user.userName} unblocked.`);
      }
    } catch (error) {
      toast.error("Could not unblock user.", {
        description: "Please try again.",
      });
    }
  };

  return (
    <ErrorBoundary fallback={<h2>Failed to load settings.</h2>}>
      <Suspense
        fallback={<MainSpinner message="Loading account settings..." />}
      >
        <main className="w-4/5 *:w-4/5 *:mx-auto">
          <div className="my-8 flex flex-col gap-6">
            <h3>Account Settings</h3>
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Privacy</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                  <AccountTypeForm isPrivateAccount={privateAccount} />
                </AccordionContent>
              </AccordionItem>
              {authType === "EMAIL" && (
                <AccordionItem value="item-2">
                  <AccordionTrigger>Security</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <Item variant="outline">
                      <ItemMedia variant="icon">
                        <ShieldAlertIcon />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>Change Password</ItemTitle>
                        <ItemDescription className="text-sm text-muted-foreground">
                          A password reset link will be sent to your email
                          address.
                        </ItemDescription>
                        <ItemFooter>
                          <p className="text-destructive">
                            WARNING: You'll be logged out once you request a
                            password change.
                          </p>
                        </ItemFooter>
                      </ItemContent>
                      <ItemActions>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handlePasswordChange}
                        >
                          {loading ? "Working..." : "Change"}
                        </Button>
                      </ItemActions>
                    </Item>
                    {emailSent && (
                      <Item
                        variant="default"
                        size="sm"
                        className="text-green-700"
                        asChild
                      >
                        <div>
                          <ItemMedia>
                            <BadgeCheckIcon className="size-5" />
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle>
                              An email was sent to your account's email address
                              with instructions to change password.
                            </ItemTitle>
                            <ItemFooter>
                              You will be logged out shortly.
                            </ItemFooter>
                          </ItemContent>
                        </div>
                      </Item>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="item-3">
                <AccordionTrigger>Blocked Accounts</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                  <div className="flex-1">
                    {blockedAccounts && blockedAccounts.length === 0 && (
                      <p>You have not blocked any accounts.</p>
                    )}
                    {blockedAccounts &&
                      blockedAccounts.length > 0 &&
                      blockedAccounts.map((user) => (
                        <div className="flex items-center p-3 border">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.pfpPath}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                            <AvatarFallback>
                              {user.firstName[0] + user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex justify-between flex-1 ml-3">
                            <div>
                              <p className="text-sm font-medium leading-none">
                                {user.firstName + " " + user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                @{user.userName}
                              </p>
                            </div>

                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                handleUnblock(user._id);
                              }}
                            >
                              Unblock
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </main>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Settings;
