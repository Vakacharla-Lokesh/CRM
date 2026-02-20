import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Upload, File } from "lucide-react";
import { useAttachmentData } from "@/hooks";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

interface AttachmentsTabProps {
  leadId: string;
}

function AttachmentsTab({ leadId }: AttachmentsTabProps) {
  const {
    attachments,
    loading,
    uploading,
    error,
    uploadAttachment,
    downloadAttachment,
    deleteAttachment,
  } = useAttachmentData(leadId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(
    null,
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    const iconColor = fileType.includes("pdf")
      ? "text-red-600"
      : fileType.includes("image")
        ? "text-blue-600"
        : fileType.includes("word") || fileType.includes("document")
          ? "text-blue-700"
          : fileType.includes("sheet") || fileType.includes("excel")
            ? "text-green-600"
            : "text-gray-600";
    return iconColor;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      await uploadAttachment(file);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  const handleDownload = async (attachment: {
    _id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    leadId: string;
    createdAt: string;
    updatedAt: string;
  }) => {
    try {
      await downloadAttachment(attachment);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    setAttachmentToDelete(attachmentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!attachmentToDelete) return;

    try {
      await deleteAttachment(attachmentToDelete);
    } catch (err) {
      console.error("Error deleting attachment:", err);
    } finally {
      setAttachmentToDelete(null);
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

      {/* Upload Area */}
      <div
        className="bg-linear-to-br from-accent to-muted/40
             border-2 border-dashed border-border
             rounded-lg p-8 text-center
             hover:border-primary/50
             hover:bg-accent/80
             transition-colors cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          if (files.length > 0) {
            handleFileSelect({
              target: { files },
            } as any);
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          accept="*/*"
        />

        <Upload
          className="w-12 h-12 text-primary
               mx-auto mb-3
               group-hover:scale-110
               transition-transform"
        />

        <h3 className="text-lg font-semibold text-foreground mb-1">
          Upload Attachment
        </h3>

        <p className="text-muted-foreground text-sm mb-2">
          Drag and drop your file or click to browse
        </p>

        <p className="text-xs text-muted-foreground/70">
          Maximum file size: 10MB
        </p>

        {uploading && (
          <div className="mt-3">
            <div
              className="w-6 h-6 border-4
                      border-primary
                      border-t-transparent
                      rounded-full animate-spin mx-auto"
            />
          </div>
        )}
      </div>

      {/* Attachments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Attachments ({attachments.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading attachments...
              </p>
            </div>
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No attachments yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment._id}
                className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <File
                      className={`w-8 h-8 ${getFileIcon(attachment.fileType)} shrink-0 mt-1`}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white wrap-break-word">
                        {attachment.fileName}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(attachment.fileSize)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(attachment.createdAt).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(attachment.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAttachment(attachment._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
        title="Delete Attachment"
        description="Are you sure you want to delete this attachment? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}

export default AttachmentsTab;
