/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  dealStatuses,
  type Deal,
  type UpdateDealDTO,
  type DealStatus,
} from "@/types/deals";
import { validateDealForm } from "@/utils/formValidators";
import type { DealFormData } from "@/utils/formValidators";

interface DealModalProps {
  isOpen: boolean;
  deal: Deal | null;
  onClose: () => void;
  onSave: (dealData: UpdateDealDTO) => Promise<void>;
}

const DealModal = ({ isOpen, deal, onClose, onSave }: DealModalProps) => {
  const [formData, setFormData] = useState<DealFormData>({
    dealName: "",
    dealValue: "",
    dealStatus: "Prospecting",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (deal) {
      setFormData({
        dealName: deal.dealName || "",
        dealValue: deal.dealValue?.toString() || "",
        dealStatus: deal.dealStatus || "Prospecting",
      });
    }
  }, [deal]);

  const handleChange = (
    field: keyof DealFormData,
    value: string | DealStatus,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors = validateDealForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const dealData: UpdateDealDTO = {
        dealName: formData.dealName.trim(),
        dealValue: parseFloat(formData.dealValue),
        dealStatus: formData.dealStatus as DealStatus,
      };

      await onSave(dealData);
      onClose();
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error saving deal:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to save deal. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        dealName: "",
        dealValue: "",
        dealStatus: "Prospecting",
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>
            Update the deal information below
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deal Name */}
            <div className="space-y-2">
              <Label htmlFor="dealName">
                Deal Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dealName"
                value={formData.dealName}
                onChange={(e) => handleChange("dealName", e.target.value)}
                placeholder="Enter deal name"
                className={errors.dealName ? "border-red-500" : ""}
              />
              {errors.dealName && (
                <p className="text-sm text-red-500">{errors.dealName}</p>
              )}
            </div>

            {/* Deal Value */}
            <div className="space-y-2">
              <Label htmlFor="dealValue">
                Deal Value <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dealValue"
                type="number"
                step="1"
                min={1}
                max={10_00_00_000}
                value={formData.dealValue}
                onChange={(e) => handleChange("dealValue", e.target.value)}
                placeholder="Enter deal value"
                className={errors.dealValue ? "border-red-500" : ""}
              />
              {errors.dealValue && (
                <p className="text-sm text-red-500">{errors.dealValue}</p>
              )}
            </div>

            {/* Deal Status */}
            <div className="space-y-2">
              <Label htmlFor="dealStatus">Deal Status</Label>
              <Select
                value={formData.dealStatus}
                onValueChange={(value) =>
                  handleChange("dealStatus", value as DealStatus)
                }
              >
                <SelectTrigger id="dealStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {dealStatuses.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DealModal;
