import { useEffect, useRef } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Participant } from "@/store/call-slice";

// Utility component to handle setting the MediaStream to the <video> srcObject
const VideoRenderer: React.FC<{ user: Participant; stream: MediaStream }> = ({
  user,
  stream,
}) => {
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = stream.getVideoTracks().length > 0;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Play is necessary in many browsers to start video after setting the stream
      videoRef.current
        .play()
        .catch((e) => console.log("Video play failed (often harmless):", e));
    }
  }, [stream]);

  return (
    <div
      key={user._id}
      className="relative rounded-lg overflow-hidden border border-slate-600/50 flex items-center justify-center group"
    >
      <div className="absolute inset-0" />
      <video
        ref={videoRef}
        autoPlay
        muted={user._id === loggedInUser?.userId}
        hidden
      />
      {!hasVideo && (
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Avatar>
            <AvatarImage src={user.pfpPath} alt={user.firstName} />
            <AvatarFallback>
              {user.firstName[0] + user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <h4 className="mt-2">
            {user._id === loggedInUser?.userId
              ? "You"
              : user.firstName + " " + user.lastName}
          </h4>
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    </div>
  );
};

export default VideoRenderer;
