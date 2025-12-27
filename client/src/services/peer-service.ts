import Peer, { MediaConnection } from "peerjs";

import { callActions, CallSession, UserPeerData } from "@/store/call-slice";
import store from "@/store/store";

import { mediaStreamStore } from "./stream-store";

class PeerJSService {
  private localPeer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private activeConnections: Map<string, MediaConnection> = new Map();
  private initialized: boolean = false;

  private initializeReduxListener() {
    store.subscribe(() => {
      const state = store.getState();
      const activeCall = state.call.activeCall;

      if (activeCall) {
        this.handleCallStateChange(activeCall);
        this.handleParticipantListChange(activeCall.participants);
      } else {
        this.cleanup();
      }
    });
  }

  public initialize() {
    if (!this.initialized) {
      this.initializeReduxListener();
      this.initialized = true;
      console.log("PeerJSService is now listening to the Redux store.");
    }
  }

  private handleCallStateChange(activeCall: CallSession) {
    const myUserId = store.getState().auth.user!.userId;
    if (
      activeCall.callStatus === "ringing" &&
      activeCall.isInitiator &&
      !activeCall.localStreamReady
    ) {
      // The caller should acquire media when the call is ringing
      this.acquireLocalMedia(myUserId);
    }

    if (
      activeCall.callStatus === "connecting" &&
      !activeCall.localStreamReady
    ) {
      this.acquireLocalMedia(myUserId);
    }

    if (activeCall.callStatus === "ended") {
      this.cleanup();
    }
  }

  private async acquireLocalMedia(userId: string) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      const myPeerId = store
        .getState()
        .call.activeCall?.participants.find(
          (p) => p.user._id === userId,
        )?.peerId;

      if (userId) {
        this.localPeer = new Peer(userId, {
          host: import.meta.env.VITE_PEER_SERVER_HOST,
          port: import.meta.env.VITE_PEER_SERVER_PORT,
          path: import.meta.env.VITE_PEER_SERVER_PATH,
          secure: true,
        });
        this.setupPeerListeners();

        mediaStreamStore.setStream(userId, this.localStream!);

        store.dispatch(
          callActions.setStreamReady({ type: "local", ready: true }),
        );

        callActions.callAccepted();
      } else {
        throw new Error("Could not find local Peer ID in Redux state.");
      }
    } catch (error) {
      console.error(
        "Failed to acquire local media or initialize PeerJS:",
        error,
      );
      store.dispatch(
        callActions.setError("Microphone/Camera access denied or failed."),
      );
      store.dispatch(
        callActions.callHangup({
          chatId: store.getState().call.activeCall?.chatId || "",
          userId,
        }),
      );
    }
  }

  private handleParticipantListChange(participants: UserPeerData[]) {
    const localPeer = this.localPeer;
    const localStream = this.localStream;
    if (!localPeer || !localStream) return;

    const myUserId = store.getState().auth.user?.userId;

    participants.forEach((peerData) => {
      if (
        peerData.user._id !== myUserId &&
        !this.activeConnections.has(peerData.user._id)
      ) {
        console.log(`Initiating call to: ${peerData.user._id}`);

        // Initiate the WebRTC call (sends SDP offer)
        const call = localPeer.call(peerData.peerId, localStream);

        // Store the connection and set up listeners
        this.activeConnections.set(peerData.user._id, call);
        this.setupCallListeners(peerData.user._id, call);
      }
    });

    this.activeConnections.forEach((conn, userId) => {
      if (!participants.some((p) => p.user._id === userId)) {
        console.log(`Closing connection to user: ${userId}`);
        conn.close();
        this.activeConnections.delete(userId);
      }
    });
  }

  private setupPeerListeners() {
    if (!this.localPeer || !this.localStream) return;

    this.localPeer.on("call", (call: MediaConnection) => {
      const remotePeerId = call.peer;
      console.log(`Receiving incoming call from Peer ID: ${remotePeerId}`);

      // Answer the call, sending our local stream back (sends SDP answer)
      call.answer(this.localStream!);

      const remoteUser = store
        .getState()
        .call.activeCall?.participants.find((p) => p.peerId === remotePeerId);
      if (remoteUser) {
        this.activeConnections.set(remoteUser.user._id, call);
        this.setupCallListeners(remoteUser.user._id, call);
      }
    });

    this.localPeer.on("error", (err) => {
      console.error("PeerJS Error:", err);
      store.dispatch(
        callActions.setError(`PeerJS Connection Error: ${err.type}`),
      );
    });
  }

  private setupCallListeners(userId: string, call: MediaConnection) {
    call.on("stream", (remoteStream: MediaStream) => {
      console.log(`Received stream from user: ${userId}`);

      mediaStreamStore.setStream(userId, remoteStream);

      store.dispatch(
        callActions.setStreamReady({ type: "remote", ready: true }),
      );

      store.dispatch(callActions.callConnected());
    });

    call.on("close", () => {
      console.log(`Connection to user ${userId} closed.`);
      mediaStreamStore.removeStream(userId);
      this.activeConnections.delete(userId);
    });
  }

  private cleanup() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;

    this.activeConnections.forEach((conn) => conn.close());
    this.activeConnections.clear();

    this.localPeer?.off("call");
    this.localPeer?.destroy();
    this.localPeer = null;
  }
}

export const peerJSService = new PeerJSService();
