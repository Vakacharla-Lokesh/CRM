export type ColorKey = "green" | "blue" | "purple" | "orange" | "teal" | "red";

export interface FeedEvent {
  id: number;
  type: string;
  icon: React.ReactNode;
  color: ColorKey;
  message: string;
  timestamp: Date;
}

export interface EventType {
  type: string;
  icon: React.ReactNode;
  color: ColorKey;
}
