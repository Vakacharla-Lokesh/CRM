import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  useLeadData,
  useDebounce,
  useBulkImportLeads,
  useNotifications,
} from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/services";
import { useOffline } from "@/context/useOffline";
import { useOfflineManager } from "@/hooks/useOfflineManager";
import { usePipelineData } from "@/hooks/usePipelineData";
import { exportEmailLeads, exportLeads } from "@/services/exportService";
import { toast } from "sonner";
import type { CreateLeadDTO, Lead } from "@/types";
import type {
  Pipeline,
  CreatePipelineDTO,
  UpdatePipelineDTO,
} from "@/types/pipeline";
import { leadsAPI } from "@/services/api";

export function useLeadsPageState() {
  const {
    filteredLeads,
    loading,
    loadingMore,
    error,
    filters,
    fetchLeads,
    createLead,
    deleteLead,
    updateFilter,
    resetFilters,
    searchLeads,
    isSearchMode,
    searchLoading,
    hasNextPage,
    loadMore,
  } = useLeadData();

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // selected lead for edit and bulk selection
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectionResetKey, setSelectionResetKey] = useState(0);

  // delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  // search state
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 400);

  // import modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // segmenting state
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [segmentCooldown, setSegmentCooldown] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // navigation
  const navigate = useNavigate();

  // offline handling
  const { isOnline } = useOffline();
  const { queue } = useOfflineManager();

  // notifications
  const { notifyEvent } = useNotifications();

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  // analytics stats
  const leadStatsQuery = useQuery({
    queryKey: [
      "analytics",
      "statusBreakdown",
      filters.pipelineId,
      filters.status,
    ],
    queryFn: () =>
      analyticsAPI.statusBreakdown({
        pipelineId: filters.pipelineId ?? undefined,
        status: filters.status ?? undefined,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const {
    pipelines,
    defaultPipeline,
    isLoading: pipelinesLoading,
    createPipeline,
    updatePipeline,
  } = usePipelineData();

  const [pipelineInitialized, setPipelineInitialized] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");

  // pipeline modal state
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [selectedPipelineForEdit, setSelectedPipelineForEdit] = useState<
    Pipeline | undefined
  >(undefined);

  useEffect(() => {
    if (!pipelineInitialized && defaultPipeline) {
      setPipelineInitialized(true);
    }
  }, [defaultPipeline, pipelineInitialized]);

  const selectedPipeline: Pipeline | undefined = pipelines.find(
    (p) => p._id === selectedPipelineId,
  );

  const pipelineStatuses = selectedPipeline?.statuses ?? [];

  const handleResetFilters = () => {
    resetFilters();
    setSelectedPipelineId("");
  };

  // fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // add lead modal handlers
  const handleAddLead = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  // pipeline modal handlers
  const handleCreatePipeline = () => {
    setSelectedPipelineForEdit(undefined);
    setIsPipelineModalOpen(true);
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setSelectedPipelineForEdit(pipeline);
    setIsPipelineModalOpen(true);
  };

  const handleSavePipeline = async (
    payload: CreatePipelineDTO | UpdatePipelineDTO,
  ) => {
    try {
      if (selectedPipelineForEdit) {
        await updatePipeline.mutateAsync({
          id: selectedPipelineForEdit._id,
          dto: payload as UpdatePipelineDTO,
        });
      } else {
        await createPipeline.mutateAsync(payload as CreatePipelineDTO);
      }
      setIsPipelineModalOpen(false);
      setSelectedPipelineForEdit(undefined);
    } catch (error) {
      console.error("Error saving pipeline:", error);
    }
  };

  const handleEditLead = (id: string) => {
    navigate(`/leads/${id}`);
  };

  const handleDeleteLead = (id: string) => {
    setLeadToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (leadToDelete) {
      try {
        await deleteLead(leadToDelete);
        setDeleteDialogOpen(false);
        setLeadToDelete(null);
        toast.success("Lead deleted successfully!");
        notifyEvent({
          type: "lead_deleted",
          title: "Lead Deleted",
          message: `A lead was deleted.`,
          entityId: leadToDelete,
          entityType: "lead",
        });
      } catch (error) {
        console.error("Error deleting lead:", error);
        toast.error("Failed to delete lead. Please try again.");
      }
    }
  };

  const handleSaveLead = async (leadData: CreateLeadDTO) => {
    try {
      await createLead(leadData);
      setIsModalOpen(false);
      toast.success("Lead created successfully!");
      notifyEvent({
        type: "lead_created",
        title: "New Lead Created",
        message: `Lead "${leadData.firstName}" was created.`,
        entityId: "",
        entityType: "lead",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "OFFLINE_QUEUED") {
        setIsModalOpen(false);
        toast.info("Lead queued for sync when online", {
          description: "Your changes will be saved when connection is restored",
        });
        return;
      }
      console.error("Error creating lead:", error);
      toast.error(
        "Failed to create lead. Please check the details and try again.",
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const handleExport = async () => {
    await exportLeads(selectedLeadIds);
    setSelectedLeadIds([]);
    setSelectionResetKey((k) => k + 1);
  };

  const handleEmailExport = async () => {
    if (!exportEmail) return;

    try {
      setIsSending(true);
      await exportEmailLeads(selectedLeadIds, exportEmail);
      toast.success("Export emailed successfully!", {
        description: "Check your inbox for the exported leads.",
      });
      setSelectedLeadIds([]);
      setSelectionResetKey((k) => k + 1);
      setExportEmail("");
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error("Error emailing export:", error);
      toast.error("Failed to email export. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // search and filter effects
  useEffect(() => {
    searchLeads(debouncedSearch, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (isSearchMode && debouncedSearch) {
      searchLeads(debouncedSearch, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.source]);

  // listen for offline sync completion
  useEffect(() => {
    const handleSync = (event: CustomEvent) => {
      const result = event.detail;
      if (result.succeeded > 0) {
        toast.success(`Synced ${result.succeeded} operations`, {
          description: "Your offline changes have been saved",
        });
        fetchLeads();
      }
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} operations`, {
          description: "Some changes couldn't be saved. Please try again.",
        });
      }
    };
    window.addEventListener("offlineSync", handleSync as EventListener);
    return () => {
      window.removeEventListener("offlineSync", handleSync as EventListener);
    };
  }, [fetchLeads]);

  const { importLeads, loading: importLoading } = useBulkImportLeads();

  const handleBulkImport = () => {
    setIsImportModalOpen(true);
  };

  const resetSelection = () => {
    setSelectedLeadIds([]);
    setSelectionResetKey((k) => k + 1);
  };

  const handleRunSegmentation = async () => {
    try {
      setIsSegmenting(true);
      const result = await leadsAPI.runRfmSegmentation();
      toast.success("Segmentation complete!", { description: result.message });
      fetchLeads();
    } catch (error) {
      console.error("RFM segmentation failed:", error);
      toast.error("Segmentation failed. Please try again.");
    } finally {
      setIsSegmenting(false);
      setSegmentCooldown(10);
      cooldownTimerRef.current = setInterval(() => {
        setSegmentCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current!);
            cooldownTimerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  return {
    // data
    filteredLeads,
    loading,
    loadingMore,
    error,
    filters,
    hasNextPage,
    loadMore,
    fetchLeads,

    // analytics
    leadStatsQuery,

    // search
    searchInput,
    setSearchInput,
    searchLoading,

    // pipeline
    pipelines,
    pipelinesLoading,
    selectedPipelineId,
    setSelectedPipelineId,
    pipelineStatuses,
    updateFilter,
    isPipelineModalOpen,
    setIsPipelineModalOpen,
    selectedPipelineForEdit,
    setSelectedPipelineForEdit,

    // modal
    isModalOpen,
    setIsModalOpen,
    selectedLead,

    // bulk selection
    selectedLeadIds,
    setSelectedLeadIds,
    selectionResetKey,
    resetSelection,

    // delete dialog
    deleteDialogOpen,
    setDeleteDialogOpen,

    // offline
    isOnline,
    queue,

    // export
    isExportDialogOpen,
    setIsExportDialogOpen,
    exportEmail,
    setExportEmail,
    isSending,

    // import
    isImportModalOpen,
    setIsImportModalOpen,
    importLeads,
    importLoading,

    // segmentation
    isSegmenting,
    setIsSegmenting,
    segmentCooldown,

    // handlers
    handleAddLead,
    handleEditLead,
    handleDeleteLead,
    confirmDelete,
    handleSaveLead,
    handleCloseModal,
    handleCreatePipeline,
    handleEditPipeline,
    handleSavePipeline,
    handleResetFilters,
    handleExport,
    handleEmailExport,
    handleBulkImport,
    handleRunSegmentation,
  };
}
