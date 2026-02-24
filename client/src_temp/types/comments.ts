// Comment Types
export interface Comment {
  _id: string;
  leadId: string;
  commentTitle: string;
  commentDesc?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDTO {
  leadId: string;
  commentTitle: string;
  commentDesc?: string;
}

export interface UpdateCommentDTO {
  commentTitle?: string;
  commentDesc?: string;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  page?: number;
  limit?: number;
}
