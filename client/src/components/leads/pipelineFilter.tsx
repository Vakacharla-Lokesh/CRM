import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Plus, Pencil } from "lucide-react";
import type { Pipeline } from "@/types/pipeline";

interface PipelineFilterProps {
  selectedPipelineId: string | undefined;
  pipelines: Pipeline[];
  onSelect: (pipelineId: string) => void;
  onCreateClick: () => void;
  onEditClick: (pipeline: Pipeline) => void;
  isLoading?: boolean;
}

export function PipelineFilter({
  selectedPipelineId,
  pipelines,
  onSelect,
  onCreateClick,
  onEditClick,
  isLoading = false,
}: PipelineFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedPipeline = pipelines.find((p) => p._id === selectedPipelineId);
  const displayName = selectedPipeline?.name || "All pipelines";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[160px] justify-between"
          disabled={isLoading}
        >
          <span className="truncate">{displayName}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="flex flex-col">
          {/* Create Pipeline Button */}
          <Button
            variant="ghost"
            className="justify-start rounded-none border-b hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => {
              onCreateClick();
              setIsOpen(false);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Pipeline
          </Button>

          {/* Pipelines List */}
          <div className="max-h-[300px] overflow-y-auto">
            {/* All Pipelines Option */}
            <button
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                !selectedPipelineId
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : ""
              }`}
              onClick={() => {
                onSelect("");
                setIsOpen(false);
              }}
            >
              All pipelines
            </button>

            {/* Individual Pipelines */}
            {pipelines.map((pipeline) => (
              <div
                key={pipeline._id}
                className={`flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group ${
                  selectedPipelineId === pipeline._id
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }`}
              >
                <button
                  className="flex-1 text-left"
                  onClick={() => {
                    onSelect(pipeline._id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`${
                        selectedPipelineId === pipeline._id
                          ? "text-blue-700 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      {pipeline.name}
                    </span>
                    {pipeline.isDefault && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        (default)
                      </span>
                    )}
                  </div>
                </button>
                <button
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(pipeline);
                    setIsOpen(false);
                  }}
                  title="Edit pipeline"
                >
                  <Pencil className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
