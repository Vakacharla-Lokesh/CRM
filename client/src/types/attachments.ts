export interface Attachment {
  _id: string;
  leadId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  s3Key: string;
  s3Url: string;
  createdAt: string;
  updatedAt: string;
}

// Sent to POST /attachments after the S3 upload completes
export interface CreateAttachmentDTO {
  leadId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  s3Key: string;
  s3Url: string;
}

// Sent to POST /attachments/presigned-url
export interface PresignedUrlRequest {
  leadId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

// Response from POST /attachments/presigned-url
export interface PresignedUrlResponse {
  presignedUrl: string;
  s3Key: string;
  s3Url: string;
}

export interface AttachmentListResponse {
  attachments: Attachment[];
  total: number;
  page?: number;
  limit?: number;
}
