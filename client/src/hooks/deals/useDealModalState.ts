import { useState } from "react";
import { type Deal, type UpdateDealDTO, type DealStatus } from "@/types/deals";
import { validateDealForm } from "@/utils/formValidators";
import type { DealFormData } from "@/utils/formValidators";

export function useDealsModalState({
  deal,
  onSave,
  onClose,
}: {
  deal: Deal | null;
  onSave: (data: UpdateDealDTO) => Promise<void>;
  onClose: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DealFormData>(
    deal
      ? {
          name: deal.name || "",
          value: deal.value?.toString() || "",
          status: deal.status || "Prospecting",
        }
      : {
          name: "",
          value: "",
          status: "Prospecting",
        },
  );

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
        name: formData.name.trim(),
        value: parseFloat(formData.value),
        status: formData.status as DealStatus,
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
        name: "",
        value: "",
        status: "Prospecting",
      });
      setErrors({});
      onClose();
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleClose,
  };
}
