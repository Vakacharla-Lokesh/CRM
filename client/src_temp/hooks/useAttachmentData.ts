import { useState, useEffect, useCallback } from "react";
import type { Attachment, CreateAttachmentDTO } from "../types";
import { attachmentsAPI } from "../services";

export const useAttachmentData = (leadId: string) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchAttachments = useCallback(async () => {
    if (!leadId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await attachmentsAPI.getByLead(leadId);
      setAttachments(response.attachments);
      setLoading(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load attachments";
      setError(message);
      console.error("Error fetching attachments:", err);
      setLoading(false);
    }
  }, [leadId]);

  const uploadAttachment = useCallback(
    async (file: File) => {
      try {
        setUploading(true);
        setError(null);

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error("File size must be less than 10MB");
        }

        const fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const data: CreateAttachmentDTO = {
          leadId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileData,
        };

        const newAttachment = await attachmentsAPI.create(data);
        setAttachments((prev) => [newAttachment, ...prev]);
        setUploading(false);
        return newAttachment;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to upload attachment";
        setError(message);
        console.error("Error uploading attachment:", err);
        setUploading(false);
        throw err;
      }
    },
    [leadId],
  );

  const downloadAttachment = useCallback(
    async (attachment: Attachment) => {
      try {
        setError(null);
        const blob = await attachmentsAPI.download(attachment._id);
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = attachment.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to download attachment";
        setError(message);
        console.error("Error downloading attachment:", err);
        throw err;
      }
    },
    [],
  );

  const deleteAttachment = useCallback(async (id: string) => {
    try {
      setError(null);
      await attachmentsAPI.delete(id);
      setAttachments((prev) =>
        prev.filter((attachment) => attachment._id !== id),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete attachment";
      setError(message);
      console.error("Error deleting attachment:", err);
      throw err;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  return {
    attachments,
    loading,
    uploading,
    error,
    uploadAttachment,
    downloadAttachment,
    deleteAttachment,
    refresh,
  };
};
