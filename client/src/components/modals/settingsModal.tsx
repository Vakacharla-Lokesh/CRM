import { useState, useEffect, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppContext } from "@/context";
import { FormField } from "./form-fields";
import { ModalFooter, ErrorAlert } from "./shared";
import { userService } from "@/services";

interface SettingsFormData {
  firstName: string;
  lastName: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SettingsFormErrors {
  firstName?: string;
  lastName?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, updateUser } = useAppContext();

  const [formData, setFormData] = useState<SettingsFormData>({
    firstName: "",
    lastName: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SettingsFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setSubmitError(null);
      setSuccessMessage(null);
    }
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: SettingsFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (
      formData.newPassword ||
      formData.oldPassword ||
      formData.confirmPassword
    ) {
      if (!formData.oldPassword) {
        newErrors.oldPassword =
          "Current password is required to change password";
      }

      if (!formData.newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your new password";
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const profileUpdated =
        formData.firstName !== user.firstName ||
        formData.lastName !== user.lastName;

      if (profileUpdated) {
        const updatedUser = await userService.updateProfile(user._id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        updateUser(updatedUser);
      }

      if (formData.newPassword) {
        await userService.updatePassword(user._id, {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        });
      }

      if (!profileUpdated && !formData.newPassword) {
        setSuccessMessage("No changes to save");
      } else {
        setSuccessMessage("Settings updated successfully");
        // Close after 1 second
        setTimeout(() => {
          onClose();
        }, 1000);
      }
      setIsSubmitting(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmitError(error.message || "Failed to update settings");
      } else {
        setSubmitError("Failed to update settings");
      }
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Update your profile information and password
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {submitError && <ErrorAlert message={submitError} />}
          {successMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Profile Information
            </h3>

            <FormField
              id="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={(value) =>
                setFormData({ ...formData, firstName: value })
              }
              placeholder="Enter first name"
              required
              error={errors.firstName}
              disabled={isSubmitting}
            />

            <FormField
              id="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={(value) =>
                setFormData({ ...formData, lastName: value })
              }
              placeholder="Enter last name"
              error={errors.lastName}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Change Password
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Leave blank to keep current password
            </p>

            <div className="space-y-2">
              <label
                htmlFor="oldPassword"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  value={formData.oldPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, oldPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white ${
                    errors.oldPassword
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="text-sm text-red-500">{errors.oldPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password"
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white ${
                    errors.newPassword
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <ModalFooter
            onCancel={handleClose}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsModal;
