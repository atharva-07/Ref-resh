import { Button } from "@/components/ui/button";

import PostWriter from "../main/post/post-writer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export interface ModalOverlayProps {
  heading: string;
  message: string;
  buttonText: string;
  writable: boolean;
  onProceed: () => void;
}

export const ModalOverlay = ({
  heading,
  message,
  buttonText,
  writable,
  onProceed,
}: ModalOverlayProps) => {
  return (
    <Card className="fixed w-[520px] top-1/3 left-1/3 z-40 border-2">
      <CardHeader>
        <CardTitle>{heading}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        {writable ? (
          <PostWriter placeholder="What's happening?" />
        ) : (
          <p>{message}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="submit"
          variant={"secondary"}
          className="w-2/6 font-semibold"
          onClick={onProceed}
        >
          {buttonText}
        </Button>
        <Button
          variant={"outline"}
          className="w-2/6 font-semibold hover:bg-destructive"
          // onClick={} Should open a warning pop-up or something
        >
          {writable ? "Cancel" : "Close"}
        </Button>
      </CardFooter>
    </Card>
  );
};
