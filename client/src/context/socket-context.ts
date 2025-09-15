import { createContext } from "react";

import { ClientSocket } from "./socket-singleton";

export const SocketContext = createContext<ClientSocket | null>(null);
