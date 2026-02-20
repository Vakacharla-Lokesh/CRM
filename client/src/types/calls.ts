// Call Types
export type CallType = "incoming" | "outgoing";

export type CallStatus = "completed" | "missed" | "no-answer" | "voicemail";

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
