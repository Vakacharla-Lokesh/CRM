import { useState, useEffect, type FormEvent } from "react";
import { User, Pencil, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "@/hooks";
import { userService } from "@/services";
import { validateSettingsForm } from "@/utils/formValidators";
import type {
  SettingsFormData,
  SettingsFormErrors,
} from "@/utils/formValidators";

import InfoTab from "@/components/modals/sections/settings/infoTab";
import EditTab from "./sections/settings/editTab";
import SecurityTab from "./sections/settings/securityTab";
import { toast } from "sonner";

type Tab = "profile" | "edit" | "security";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
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

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "edit", label: "Edit Profile", icon: <Pencil size={16} /> },
    { id: "security", label: "Security", icon: <Shield size={16} /> },
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
    >
      <DialogContent className="p-0 gap-0 sm:max-w-2xl overflow-hidden">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <div className="flex h-130">
          {/* Sidebar */}
          <aside className="w-48 shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col pt-6 pb-4">
            <p className="px-4 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Settings
            </p>
            <nav className="flex flex-col gap-1 px-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left ${
                    activeTab === item.id
                      ? "text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700"
                      : "text-gray-600 dark:text-gray-400 hover:bg-secondary dark:hover:bg-secondary-foreground"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <InfoTab
                user={user!}
                initials={initials}
              />
            )}

            {/* EDIT PROFILE TAB */}
            {activeTab === "edit" && (
              <EditTab
                profileData={profileData}
                setProfileData={setProfileData}
                profileErrors={profileErrors}
                isProfileSubmitting={isProfileSubmitting}
                handleProfileSubmit={handleProfileSubmit}
                profileSubmitError={profileSubmitError}
                profileSuccess={profileSuccess}
                handleClose={handleClose}
              />
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <SecurityTab
                securityData={securityData}
                setSecurityData={setSecurityData}
                securityErrors={securityErrors}
                isSecuritySubmitting={isSecuritySubmitting}
                handleSecuritySubmit={handleSecuritySubmit}
                securitySubmitError={securitySubmitError}
                securitySuccess={securitySuccess}
                handleClose={handleClose}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsModal;
