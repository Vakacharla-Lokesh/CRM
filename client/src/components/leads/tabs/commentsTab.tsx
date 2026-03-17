import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useCommentData } from "@/hooks";
import { ConfirmDialog } from "@/components/common/confirmDialog";

interface CommentsTabProps {
  leadId: string;
}

function CommentsTab({ leadId }: CommentsTabProps) {
  const { comments, loading, error, createComment, deleteComment } =
    useCommentData(leadId);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    try {
      setIsAdding(true);

      await createComment({
        title: formData.title,
        description: formData.description,
      });

      setFormData({ title: "", description: "" });
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding comment:", err);
      setIsAdding(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      await deleteComment(commentToDelete);
      setCommentToDelete(null);
    } catch (err) {
      console.error("Error deleting comment:", err);
      setCommentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-secondary rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
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
              className="resize-none"
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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Comments ({comments.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">
                Loading comments...
              </p>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-muted/40 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground wrap-break-word">
                      {comment.title}
                    </h4>
                    {comment.description && (
                      <p className="text-muted-foreground mt-2 whitespace-pre-wrap wrap-break-word">
                        {comment.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                      {new Date(comment.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-destructive hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}

export default CommentsTab;
