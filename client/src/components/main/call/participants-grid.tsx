import { useAppSelector } from "@/hooks/useAppSelector";
import { useCallStreams } from "@/hooks/useCallStream";

import VideoRenderer from "./renderer";

const ParticipantsGrid = () => {
  const gridColsMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2",
    4: "grid-cols-2",
  };

  const callState = useAppSelector((state) => state.call.activeCall);
  const streamsMap = useCallStreams();

  if (
    !callState ||
    callState.callStatus === "ringing" ||
    callState.callStatus === "idle"
  ) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        {callState?.callStatus === "ringing"
          ? "Ringing..."
          : "Call not active."}
      </div>
    );
  }

  // Combine Redux participants list with the actual streams
  const participantsWithStreams = callState.participants
    .map((p) => ({
      ...p,
      stream: streamsMap.get(p.user._id),
    }))
    .filter((p) => p.stream); // Only render tiles for participants with an active stream

  const gridColsClass =
    gridColsMap[participantsWithStreams.length] ?? "grid-cols-2";

  if (participantsWithStreams.length === 0) {
    return <div>Connecting...</div>;
  }

  return (
    // <div className="flex-1 p-6 overflow-hidden">
    //   <div className={`grid ${gridColsClass} gap-4 h-full`}>
    //     {participants.map((participant) => (
    //       <div
    //         key={participant.id}
    //         className="relative rounded-lg overflow-hidden border border-slate-600/50 flex items-center justify-center group"
    //       >
    //         <div className="absolute inset-0" />

    //         <div className="relative z-10 flex flex-col items-center justify-center">
    //           <div className="text-6xl mb-4">{participant.avatar}</div>
    //           <h3 className="text-white font-semibold text-lg">
    //             {participant.name}
    //           </h3>
    //           {participant.isMuted && (
    //             <span className="text-xs text-red-400 mt-2 bg-red-500/20 px-2 py-1 rounded">
    //               Muted
    //             </span>
    //           )}
    //         </div>

    //         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    //       </div>
    //     ))}
    //   </div>
    // </div>

    // <div className={`video-grid grid-${participantsWithStreams.length}`}>
    //   {participantsWithStreams.map((p) => (
    //     <VideoRenderer key={p.user._id} user={p.user} stream={p.stream!} />
    //   ))}
    // </div>

    <div className="flex-1 p-6 overflow-hidden">
      <div className={`grid ${gridColsClass} gap-4 h-full`}>
        {participantsWithStreams.map((p) => (
          <VideoRenderer key={p.user._id} user={p.user} stream={p.stream!} />
        ))}
      </div>
    </div>
  );
};

export default ParticipantsGrid;
