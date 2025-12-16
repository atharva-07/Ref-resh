import { useMutation } from "@apollo/client";
import { Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JOIN_CALL } from "@/gql-calls/mutation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { callActions } from "@/store/call-slice";
import { MAX_RINGING_TIME_SEC } from "@/utility/constants";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const IncomingCallDialog = () => {
  const [countdown, setCountdown] = useState(MAX_RINGING_TIME_SEC);
  const [joinCall, { loading, error }] = useMutation(JOIN_CALL);

  const dispatch = useAppDispatch();
  const activeCall = useAppSelector((state) => state.call.activeCall);
  const caller = activeCall?.participants[0]?.user;
  const { user } = useAppSelector((state) => state.auth);

  const handleAccept = async () => {
    try {
      const { data } = await joinCall({
        variables: {
          callId: activeCall?.callId,
        },
      });
      if (data) {
        dispatch(
          callActions.callJoin({
            chatId: activeCall?.chatId || "",
            user: {
              _id: user!.userId,
              firstName: user!.fullName.split(" ")[0] || "",
              lastName: user!.fullName.split(" ")[1] || "",
              userName: user!.username,
              pfpPath: user!.pfpPath || "",
            },
            peerId: user!.userId,
          })
        );
        setCountdown(MAX_RINGING_TIME_SEC);
      }
    } catch (error) {
      const genericErrorMessage = "Could not join call.";
      callActions.setError(genericErrorMessage);
      toast.error(genericErrorMessage, {
        description: "Please try again later.",
      });
    }
  };

  const handleDecline = () => {
    dispatch(
      callActions.callHangup({
        chatId: activeCall?.chatId || "",
        userId: user?.userId || "",
      })
    );
    setCountdown(MAX_RINGING_TIME_SEC);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDecline();
          return MAX_RINGING_TIME_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      setCountdown(MAX_RINGING_TIME_SEC);
    };
  });

  // Only render the modal if a call is active AND it is ringing (incoming)
  if (
    !activeCall ||
    !caller ||
    activeCall.callStatus !== "ringing" ||
    activeCall.isInitiator
  ) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm border-2 flex flex-col rounded-2xl">
        <DialogHeader className="hidden">
          <DialogTitle className="border-0"></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="rounded-full flex items-center justify-center text-4xl overflow-hidden">
            <Avatar className="w-16 h-16">
              <AvatarImage src={caller.pfpPath} alt={caller.firstName} />
              <AvatarFallback>
                {caller.firstName[0] + caller.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-2">
              {caller.firstName + " " + caller.lastName}
            </h3>
            <p className="text-sm">is calling you...</p>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              Call will be auto-declined if not answered in some time.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleDecline}
            className="flex-1 bg-red-600 hover:bg-red-700 font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5 rotate-[135deg]" />
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncomingCallDialog;
