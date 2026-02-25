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
  fileData: string;
}

export interface AttachmentListResponse {
  attachments: Attachment[];
  total: number;
  page?: number;
  limit?: number;
}
