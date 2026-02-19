export interface ConnectivityState {
  ws: boolean;
  sse: boolean;
  longPoll: boolean;
  shortPoll: boolean;
}

export interface ProtocolProps {
  name: string;
  status: boolean;
  tooltip: string;
}