const streams: Map<string, MediaStream> = new Map();
const subscribers: Set<() => void> = new Set();

const notifySubscribers = () => {
  subscribers.forEach((callback) => callback());
};

export const mediaStreamStore = {
  getStreams: () => new Map(streams),

  setStream(userId: string, stream: MediaStream) {
    streams.set(userId, stream);
    notifySubscribers();
  },

  removeStream(userId: string) {
    streams.delete(userId);
    notifySubscribers();
  },

  subscribe: (callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },
};
