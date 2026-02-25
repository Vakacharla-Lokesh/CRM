export type CallType = "incoming" | "outgoing";

export const CALL_TYPE_LABELS: Record<CallType, string> = {
  incoming: "Incoming",
  outgoing: "Outgoing",
};

export type CallStatus = "completed" | "missed" | "no-answer" | "voicemail";

export const CALL_STATUSES: CallStatus[] = [
  "completed",
  "missed",
  "no-answer",
  "voicemail",
];

export interface Call {
  _id: string;
  leadId: string;
  callType: CallType;
  callNotes?: string;
  status: CallStatus;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCallDTO {
  leadId: string;
  callType: CallType;
  status: CallStatus;
  callNotes?: string;
  duration?: number;
}

export interface UpdateCallDTO {
  callType?: CallType;
  status?: CallStatus;
  callNotes?: string;
  duration?: number;
}

export interface CallListResponse {
  calls: Call[];
  total: number;
  page?: number;
  limit?: number;
}
