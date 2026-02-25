import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Attachment, CreateAttachmentDTO } from "../types";
import { attachmentsAPI } from "../services";

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

      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const payload: CreateAttachmentDTO = {
        leadId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData,
      };

      return attachmentsAPI.create(payload);
    },
    onSuccess: (newAttachment) => {
      queryClient.setQueryData<Attachment[]>(queryKey, (prev = []) => [
        newAttachment,
        ...prev,
      ]);
    },
    onError: (err) => {
      console.error("Error uploading attachment:", err);
    },
  });

  const uploading = uploadMutation.isPending;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => attachmentsAPI.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Attachment[]>(queryKey, (prev = []) =>
        prev.filter((a) => a._id !== id),
      );
    },
    onError: (err) => {
      console.error("Error deleting attachment:", err);
    },
  });

  const downloadAttachment = useCallback(async (attachment: Attachment) => {
    try {
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
