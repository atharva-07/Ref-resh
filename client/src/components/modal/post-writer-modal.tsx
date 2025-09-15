import { ReactNode, useRef, useState } from "react";

import PostForm from "@/components/forms/post-form";
import {
  AlertDialog,
  AlertDialogAction,
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

const PostWriterModal = ({ children }: { children: ReactNode }) => {
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
          <AlertDialogTitle>Create New Post</AlertDialogTitle>
          <AlertDialogDescription>
            Here's your turn to channel your inner poet or a shitposter...
          </AlertDialogDescription>
          <PostForm
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
                <DialogTitle>Discard Post?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to discard this post?
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
                    Discard Post
                  </AlertDialogCancel>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSavePost}>
            {isSubmitting ? "Saving..." : "Save Post"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PostWriterModal;
