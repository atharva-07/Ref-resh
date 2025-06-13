import { ReactNode } from "react";

import PostForm from "@/components/forms/PostForm";
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
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* <Button className="font-semibold">Compose New Post</Button> */}
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Post</AlertDialogTitle>
          <AlertDialogDescription>
            Here's your turn to channel your inner poet or a shitposter...
          </AlertDialogDescription>
          <PostForm />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
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
                  <AlertDialogCancel>Discard Post</AlertDialogCancel>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialogAction>Save Post</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PostWriterModal;
