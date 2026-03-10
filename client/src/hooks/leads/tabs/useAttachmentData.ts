import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Attachment } from "@/types";
import { attachmentsAPI } from "@/services";

export const useAttachmentData = (leadId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["attachments", "lead", leadId];

  const {
    data,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey,
    queryFn: () => attachmentsAPI.getByLead(leadId),
    enabled: !!leadId,
    staleTime: 30_000,
    select: (res) => res.attachments,
  });

  const attachments: Attachment[] = data ?? [];
  const error = queryError instanceof Error ? queryError.message : null;

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const maxSize = 10 * 1024 * 1024; // 10 MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 10MB");
      }

      const { presignedUrl, s3Key, s3Url } = await attachmentsAPI.getPresignedUrl({
        leadId,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      });

      await attachmentsAPI.uploadToS3(presignedUrl, file);

      return attachmentsAPI.create({
        leadId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        s3Key,
        s3Url,
      });
    },
    onSuccess: (newAttachment) => {
      queryClient.setQueryData<{ attachments: Attachment[]; total: number }>(
        queryKey,
        (prev) => ({
          attachments: [newAttachment, ...(prev?.attachments ?? [])],
          total: (prev?.total ?? 0) + 1,
        }),
      );
    },
    onError: (err) => {
      console.error("Error uploading attachment:", err);
    },
  });

  const uploading = uploadMutation.isPending;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => attachmentsAPI.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<{ attachments: Attachment[]; total: number }>(
        queryKey,
        (prev) => ({
          attachments: (prev?.attachments ?? []).filter((a) => a._id !== id),
          total: Math.max(0, (prev?.total ?? 1) - 1),
        }),
      );
    },
    onError: (err) => {
      console.error("Error deleting attachment:", err);
    },
  });

  const downloadAttachment = useCallback(async (attachment: Attachment) => {
    try {
      // Server generates a fresh presigned GET URL; client opens it directly
      const url = await attachmentsAPI.download(attachment._id);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error downloading attachment:", err);
      throw err;
    }
  }, []);

  const uploadAttachment = useCallback(
    (file: File) => uploadMutation.mutateAsync(file),
    [uploadMutation],
  );

  const deleteAttachment = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, leadId]);

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
