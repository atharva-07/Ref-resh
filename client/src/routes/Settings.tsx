import { useMutation, useSuspenseQuery } from "@apollo/client";
import { Suspense } from "react";
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
import { BLOCK_UNBLOCK_USER } from "@/gql-calls/mutation";
import { GET_ACCOUNT_SETTINGS_DATA } from "@/gql-calls/queries";

const Settings = () => {
  const { data } = useSuspenseQuery(GET_ACCOUNT_SETTINGS_DATA);
  const blockedAccounts = data?.fetchAccountSettingsData?.blockedAccounts || [];
  const privateAccount =
    data?.fetchAccountSettingsData?.privateAccount || false;

  const [unblockUser] = useMutation(BLOCK_UNBLOCK_USER);

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
              <AccordionItem value="item-2">
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
