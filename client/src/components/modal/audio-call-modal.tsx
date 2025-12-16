import { useMutation } from "@apollo/client";
import { ChevronLeft, ChevronRight, Phone } from "lucide-react";
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
import { LEAVE_CALL } from "@/gql-calls/mutation";
import { GET_CALLS_HISTORY_BY_CHAT } from "@/gql-calls/queries";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { callActions } from "@/store/call-slice";
import { MAX_RINGING_TIME_MS } from "@/utility/constants";

import ChatForm from "../forms/chat-form";
import ParticipantsGrid from "../main/call/participants-grid";
import { Chat } from "../main/chat/chat";

export function AudioCallDialog() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [leaveCall, { loading, error }] = useMutation(LEAVE_CALL);

  const activeCall = useAppSelector((state) => state.call.activeCall);
  // Should be visible to the caller when ringing, connecting and connected
  // Should be visible to the callee when connected
  const isCallActive =
    activeCall &&
    ((activeCall.callerId === user?.userId &&
      (activeCall.callStatus === "ringing" ||
        activeCall.callStatus === "connecting" ||
        activeCall.callStatus === "connected")) ||
      (activeCall.callerId !== user?.userId &&
        activeCall.callStatus === "connected"));

  // Timer effect
  useEffect(() => {
    if (activeCall?.callStatus === "connected") {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (!activeCall) {
      setElapsedTime(0);
    }
    return () => {};
  }, [activeCall]);

  useEffect(() => {
    if (
      activeCall &&
      activeCall.isInitiator &&
      (activeCall.callStatus === "ringing" ||
        activeCall.callStatus === "connecting")
    ) {
      const timerId = setTimeout(() => {
        dispatch(
          callActions.callHangup({
            chatId: activeCall.chatId,
            userId: user!.userId,
          })
        );
      }, MAX_RINGING_TIME_MS);

      return () => {
        setSidebarOpen(false);
        clearTimeout(timerId);
      };
    }

    return () => {};
  }, [activeCall, dispatch, user]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDisconnect = async () => {
    try {
      await leaveCall({
        variables: {
          callId: activeCall?.callId,
        },
        refetchQueries: [
          {
            query: GET_CALLS_HISTORY_BY_CHAT,
            variables: {
              chatId: activeCall?.chatId,
              pageSize: 1,
            },
          },
        ],
      });
    } catch (error) {
      toast.error("Something went wrong while disconnecting the call.");
    } finally {
      dispatch(
        callActions.callHangup({
          chatId: activeCall?.chatId || "",
          userId: user!.userId,
        })
      );
      setSidebarOpen(false);
    }
  };

  return (
    isCallActive && (
      <Dialog open={!!isCallActive} onOpenChange={() => {}}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 border-2 flex flex-col">
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="text-xl font-semibold">
              Audio Call
            </DialogTitle>
            <DialogDescription className="pt-1">
              Call duration: {formatTime(elapsedTime)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col border">
              <ParticipantsGrid />

              <div className="border-t px-6 py-4 flex items-center justify-center gap-4">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleDisconnect}
                  className="rounded-full w-14 h-14 p-0 bg-destructive hover:bg-destructive/80"
                >
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </Button>
              </div>
            </div>

            {sidebarOpen && activeCall?.chatId && (
              <div className="w-80 border-l flex flex-col">
                <div className="border py-1 text-xs text-center uppercase tracking-widest">
                  Chat Messages
                </div>
                <Chat chatId={activeCall?.chatId} />
                <ChatForm chatId={activeCall?.chatId} />
              </div>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-l-lg p-2 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    )
  );
}
