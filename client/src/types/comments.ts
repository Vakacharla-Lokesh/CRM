// Comment Types
export interface Comment {
  _id: string;
  leadId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDTO {
  leadId: string;
  title: string;
  description?: string;
}

export interface UpdateCommentDTO {
  title?: string;
  description?: string;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  page?: number;
  limit?: number;
}
