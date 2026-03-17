// 📍 FILE: client/src/components/modals/BulkImportModal.tsx
// 🔴 REPLACE ENTIRE FILE:

import { useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface BulkImportResult {
  message: string;
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}

interface ColumnGuideEntry {
  name: string;
  required?: boolean;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Entity-specific props
  title: string;
  description?: string;
  columns: ColumnGuideEntry[];
  importFn: (file: File) => Promise<BulkImportResult>;
  loading: boolean;
}

type ModalState = "idle" | "file_selected" | "success" | "partial";

export default function BulkImportModal({
  isOpen,
  onClose,
  title,
  description = "Upload a CSV or Excel file. Limit: 1000 rows per import.",
  columns,
  importFn,
  loading,
}: BulkImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [modalState, setModalState] = useState<ModalState>("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setResult(null);
    setModalState("file_selected");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setResult(null);
    setModalState("file_selected");
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    const res = await importFn(selectedFile);
    setResult(res);
    setModalState(
      res.failed > 0 || res.errors.length > 0 ? "partial" : "success",
    );
  };

  const resetState = () => {
    setSelectedFile(null);
    setResult(null);
    setModalState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Close immediately (so parent can start dialog close animation),
  // then reset local state after a short delay to avoid a visible flash.
  const closeAfterDelay = (delay = 260) => {
    onClose();
    setTimeout(resetState, delay);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeAfterDelay();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Drop zone */}
          {modalState !== "success" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3 text-gray-700 dark:text-gray-300">
                  <FileSpreadsheet className="w-6 h-6 text-blue-500 shrink-0" />
                  <span className="font-medium truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setModalState("idle");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="ml-1 text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag & drop a file here, or{" "}
                    <span className="text-blue-500 font-medium">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    .csv, .xlsx, .xls — max 5 MB
                  </p>
                </>
              )}
            </div>
          )}

          {/* Column guide */}
          {modalState === "idle" && (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md p-3">
              <p className="font-medium text-gray-600 dark:text-gray-300 mb-2">
                Expected columns:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {columns.map((col) => (
                  <span
                    key={col.name}
                    className="inline-flex items-center gap-1"
                  >
                    <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      {col.name}
                    </span>
                    {col.required && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-gray-400">* required</p>
            </div>
          )}

          {/* Result state */}
          {(modalState === "success" || modalState === "partial") && result && (
            <div className="space-y-3">
              <div
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  modalState === "success"
                    ? "bg-green-50 dark:bg-green-950/20"
                    : "bg-amber-50 dark:bg-amber-950/20"
                }`}
              >
                {modalState === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                )}
                <div className="text-sm space-y-0.5">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {result.message}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {result.imported} imported · {result.skipped} skipped
                    (duplicates) · {result.failed} failed
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-3 space-y-1">
                  <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                    Row errors:
                  </p>
                  {result.errors.map((err, i) => (
                    <p
                      key={i}
                      className="text-xs text-red-600 dark:text-red-400"
                    >
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => closeAfterDelay()}
              disabled={loading}
            >
              {modalState === "success" ? "Close" : "Cancel"}
            </Button>
            {modalState !== "success" && (
              <Button
                onClick={handleImport}
                disabled={!selectedFile || loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  `Import ${title.replace("Import ", "")}`
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
