import React, { useState } from "react";
import { ErrorAlert, ModalFooter } from "@/components/modals/shared";
import { Eye, EyeOff } from "lucide-react";
import type { SettingsFormErrors } from "@/utils";

function SecurityTab({
  securityData,
  setSecurityData,
  securityErrors,
  isSecuritySubmitting,
  handleSecuritySubmit,
  securitySubmitError,
  securitySuccess,
  handleClose,
}: {
  securityData: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setSecurityData: (data: typeof securityData) => void;
  securityErrors: Pick<
    SettingsFormErrors,
    "oldPassword" | "newPassword" | "confirmPassword"
  >;
  isSecuritySubmitting: boolean;
  handleSecuritySubmit: (e: React.FormEvent) => void;
  securitySubmitError: string | null;
  securitySuccess: string | null;
  handleClose: () => void;
}) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Security
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Change your password
        </p>
      </div>

      <form
        onSubmit={handleSecuritySubmit}
        className="space-y-4"
      >
        {securitySubmitError && <ErrorAlert message={securitySubmitError} />}
        {securitySuccess && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-600 dark:text-green-400">
              {securitySuccess}
            </p>
          </div>
        )}

        {/* Current Password */}
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
              value={securityData.oldPassword}
              onChange={(e) =>
                setSecurityData({
                  ...securityData,
                  oldPassword: e.target.value,
                })
              }
              placeholder="Enter current password"
              className={`w-full px-3 py-2 border rounded-md bg-secondary dark:bg-secondary-foreground text-primary dark:text-primary-foreground pr-10 ${
                securityErrors.oldPassword
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              disabled={isSecuritySubmitting}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {securityErrors.oldPassword && (
            <p className="text-sm text-red-500">{securityErrors.oldPassword}</p>
          )}
        </div>

        {/* New Password */}
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
              value={securityData.newPassword}
              onChange={(e) =>
                setSecurityData({
                  ...securityData,
                  newPassword: e.target.value,
                })
              }
              placeholder="Enter new password"
              className={`w-full px-3 py-2 border rounded-md bg-secondary dark:bg-secondary-foreground text-primary dark:text-primary-foreground pr-10 ${
                securityErrors.newPassword
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              disabled={isSecuritySubmitting}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {securityErrors.newPassword && (
            <p className="text-sm text-red-500">{securityErrors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
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
              value={securityData.confirmPassword}
              onChange={(e) =>
                setSecurityData({
                  ...securityData,
                  confirmPassword: e.target.value,
                })
              }
              placeholder="Confirm new password"
              className={`w-full px-3 py-2 border rounded-md bg-secondary dark:bg-secondary-foreground text-primary dark:text-primary-foreground pr-10 ${
                securityErrors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              disabled={isSecuritySubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {securityErrors.confirmPassword && (
            <p className="text-sm text-red-500">
              {securityErrors.confirmPassword}
            </p>
          )}
        </div>

        <ModalFooter
          onCancel={handleClose}
          isSubmitting={isSecuritySubmitting}
          submitLabel="Update Password"
        />
      </form>
    </div>
  );
}

export default SecurityTab;
