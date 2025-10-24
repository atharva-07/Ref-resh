import { useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import UserSetupForm from "../forms/user-setup-form";

const UserSetupModal = () => {
  const userSetupFormRef = useRef<{ submitForm: () => Promise<void> }>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSaveInfo = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (userSetupFormRef.current && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await userSetupFormRef.current.submitForm();
      } catch (error) {
        console.error("Error submitting user setup form: ", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Information</AlertDialogTitle>
          <AlertDialogDescription>
            Please set the required fields to start using Ref-resh.
          </AlertDialogDescription>
          <UserSetupForm
            ref={userSetupFormRef}
            onSubmissionComplete={() => {
              setIsAlertOpen(false);
              setIsSubmitting(false);
            }}
          />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={handleSaveInfo}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserSetupModal;
