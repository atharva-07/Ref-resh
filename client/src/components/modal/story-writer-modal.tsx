import { ReactNode, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import StoryForm from "../forms/story-form";

const StoryWriterModal = ({ children }: { children: ReactNode }) => {
  const postFormRef = useRef<{ submitForm: () => Promise<void> }>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSavePost = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (postFormRef.current && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await postFormRef.current.submitForm();
      } catch (error) {
        console.error("Error submitting new post form: ", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogTrigger asChild onClick={() => setIsAlertOpen(true)}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add to your story</AlertDialogTitle>
          <AlertDialogDescription>
            So, how would you describe your day?
          </AlertDialogDescription>
          <StoryForm
            ref={postFormRef}
            onSubmissionComplete={() => {
              setIsAlertOpen(false);
              setIsDialogOpen(false);
              setIsSubmitting(false);
            }}
          />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                Cancel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Discard Story?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to discard this story?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>
                    Discard Story
                  </AlertDialogCancel>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSavePost}>
            {isSubmitting ? "Saving..." : "Add Story"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StoryWriterModal;
