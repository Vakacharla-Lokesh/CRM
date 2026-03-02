/* eslint-disable react-refresh/only-export-components */
import React, { type ReactNode } from "react";
import { useSocket } from "../hooks/useSocket";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SocketContext = React.createContext<any>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socket = useSocket();

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
