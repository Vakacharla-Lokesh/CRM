// Attachment Types
export interface Attachment {
  _id: string;
  leadId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttachmentDTO {
  leadId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData: string; // base64 encoded file data
}

export interface AttachmentListResponse {
  attachments: Attachment[];
  total: number;
  page?: number;
  limit?: number;
}
