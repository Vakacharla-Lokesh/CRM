import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface Comment {
  _id: string;
  leadId: string;
  commentTitle: string;
  commentDesc?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CommentsTabProps {
  leadId: string;
}

/**
 * CommentsTab Component
 * Manage comments for a lead
 * Features:
 * - Add new comments with title and description
 * - View all comments
 * - Delete comments
 * - Shows creation timestamp
 */
function CommentsTab({ leadId }: CommentsTabProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  useEffect(() => {
    fetchComments();
  }, [leadId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual API call
      // const response = await commentService.getCommentsByLead(leadId);
      // setComments(response);
      setComments([]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load comments";
      setError(message);
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Comment title is required");
      return;
    }

    try {
      setIsAdding(true);
      setError(null);

      // TODO: Replace with actual API call
      // const newComment = await commentService.createComment({
      //   leadId,
      //   commentTitle: formData.title,
      //   commentDesc: formData.description,
      // });
      // setComments([newComment, ...comments]);

      // Mock implementation
      const mockComment: Comment = {
        _id: Date.now().toString(),
        leadId,
        commentTitle: formData.title,
        commentDesc: formData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setComments([mockComment, ...comments]);
      setFormData({ title: "", description: "" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add comment";
      setError(message);
      console.error("Error adding comment:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      setError(null);
      // TODO: Replace with actual API call
      // await commentService.deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete comment";
      setError(message);
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Add Comment Form */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add New Comment
        </h3>
        <form
          onSubmit={handleAddComment}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Comment title"
              disabled={isAdding}
              className="border-gray-300 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add comment details (optional)"
              rows={4}
              disabled={isAdding}
              className="border-gray-300 dark:border-gray-600 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isAdding || !formData.title.trim()}
            >
              {isAdding ? "Adding..." : "Add Comment"}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading comments...
              </p>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No comments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white wrap-break-word">
                      {comment.commentTitle}
                    </h4>
                    {comment.commentDesc && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap wrap-break-word">
                        {comment.commentDesc}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                      {new Date(comment.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentsTab;
