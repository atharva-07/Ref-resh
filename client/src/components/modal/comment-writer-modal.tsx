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

import CommentForm from "../forms/comment-form";

const CommentWriterModal = ({
  children,
  postId,
  parentCommentId,
}: {
  children: ReactNode;
  postId: string;
  parentCommentId: string | null;
}) => {
  const commentFormRef = useRef<{ submitForm: () => Promise<void> }>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSaveComment = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (commentFormRef.current && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await commentFormRef.current.submitForm();
      } catch (error) {
        console.error("Error submitting new comment form: ", error);
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
          <AlertDialogTitle>Add New Comment</AlertDialogTitle>
          <AlertDialogDescription>
            Would you be sweet, mean, arrogant or factual?
          </AlertDialogDescription>
          <CommentForm
            ref={commentFormRef}
            postId={postId}
            parentCommentId={parentCommentId}
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
                <DialogTitle>Discard Comment?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to discard this comment?
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
                    Discard Comment
                  </AlertDialogCancel>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSaveComment}>
            {isSubmitting ? "Saving..." : "Save Comment"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CommentWriterModal;
