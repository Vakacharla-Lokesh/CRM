import { useState, useEffect, type FormEvent } from "react";
import { useAppContext } from "@/hooks";
import { userService } from "@/services";
import { validateSettingsForm } from "@/utils/formValidators";
import type {
  SettingsFormData,
  SettingsFormErrors,
} from "@/utils/formValidators";

import { toast } from "sonner";
import type { SettingsModalProps, Tab } from "@/types/constants/settings";

export function useSettingsModalState({ isOpen, onClose }: SettingsModalProps) {
  const { user, updateUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile/Edit state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
  });
  const [profileErrors, setProfileErrors] = useState<
    Pick<SettingsFormErrors, "firstName" | "lastName">
  >({});
  const [profileSubmitError, setProfileSubmitError] = useState<string | null>(
    null,
  );
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // Security state
  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securityErrors, setSecurityErrors] = useState<
    Pick<SettingsFormErrors, "oldPassword" | "newPassword" | "confirmPassword">
  >({});
  const [securitySubmitError, setSecuritySubmitError] = useState<string | null>(
    null,
  );
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [isSecuritySubmitting, setIsSecuritySubmitting] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
      resetAll();
    }
  }, [user, isOpen]);

  const resetAll = () => {
    setProfileErrors({});
    setProfileSubmitError(null);
    setProfileSuccess(null);
    setSecurityData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setSecurityErrors({});
    setSecuritySubmitError(null);
    setSecuritySuccess(null);
  };

  const handleClose = () => {
    if (!isProfileSubmitting && !isSecuritySubmitting) onClose();
  };

  // --- Profile submit ---
  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formDataForValidation: SettingsFormData = {
      ...profileData,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    const allErrors = validateSettingsForm(formDataForValidation);
    const relevant: Pick<SettingsFormErrors, "firstName" | "lastName"> = {};
    if (allErrors.firstName) relevant.firstName = allErrors.firstName;
    if (allErrors.lastName) relevant.lastName = allErrors.lastName;

    setProfileErrors(relevant);
    if (Object.keys(relevant).length > 0) return;

    setIsProfileSubmitting(true);
    setProfileSubmitError(null);
    setProfileSuccess(null);

    try {
      const profileChanged =
        profileData.firstName !== user.firstName ||
        profileData.lastName !== user.lastName;

      if (!profileChanged) {
        setProfileSuccess("No changes to save.");
        setIsProfileSubmitting(false);
        return;
      }

      const updatedUser = await userService.updateProfile(user._id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });
      updateUser(updatedUser);
      setProfileSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (error: unknown) {
      setProfileSubmitError(
        error instanceof Error ? error.message : "Failed to update profile.",
      );
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handleSecuritySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formDataForValidation: SettingsFormData = {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      ...securityData,
    };
    const allErrors = validateSettingsForm(formDataForValidation);
    const relevant: Pick<
      SettingsFormErrors,
      "oldPassword" | "newPassword" | "confirmPassword"
    > = {};
    if (allErrors.oldPassword) relevant.oldPassword = allErrors.oldPassword;
    if (allErrors.newPassword) relevant.newPassword = allErrors.newPassword;
    if (allErrors.confirmPassword)
      relevant.confirmPassword = allErrors.confirmPassword;

    setSecurityErrors(relevant);
    if (Object.keys(relevant).length > 0) return;

    if (!securityData.newPassword) {
      setSecuritySubmitError("Please enter a new password.");
      return;
    }

    setIsSecuritySubmitting(true);
    setSecuritySubmitError(null);
    setSecuritySuccess(null);

    try {
      await userService.updatePassword(user._id, {
        oldPassword: securityData.oldPassword,
        newPassword: securityData.newPassword,
      });
      setSecurityData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSecuritySuccess("Password updated successfully!");
      setTimeout(() => setSecuritySuccess(null), 3000);
    } catch (error: unknown) {
      setSecuritySubmitError(
        error instanceof Error ? error.message : "Failed to update password.",
      );
    } finally {
      setIsSecuritySubmitting(false);
    }
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return {
    activeTab,
    setActiveTab,
    profileData,
    setProfileData,
    profileErrors,
    profileSubmitError,
    profileSuccess,
    isProfileSubmitting,
    securityData,
    setSecurityData,
    securityErrors,
    securitySubmitError,
    securitySuccess,
    isSecuritySubmitting,
    handleClose,
    handleProfileSubmit,
    handleSecuritySubmit,
    initials,
    user,
  };
}
