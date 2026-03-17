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
        <h2 className="text-lg font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Change your password
        </p>
      </div>

      <form
        onSubmit={handleSecuritySubmit}
        className="space-y-4"
      >
        {securitySubmitError && <ErrorAlert message={securitySubmitError} />}

        {securitySuccess && (
          <div className="p-3 bg-accent/20 border border-border rounded-md">
            <p className="text-sm text-foreground">{securitySuccess}</p>
          </div>
        )}

        {/* Current Password */}
        <div className="space-y-2">
          <label
            htmlFor="oldPassword"
            className="block text-sm font-semibold text-foreground"
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
              className={`w-full px-3 py-2 pr-10 rounded-md border
              bg-background text-foreground
              focus:outline-none focus:ring-2 focus:ring-ring
              ${
                securityErrors.oldPassword
                  ? "border-destructive"
                  : "border-input"
              }`}
              disabled={isSecuritySubmitting}
            />

            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2
              text-muted-foreground hover:text-foreground
              transition-colors"
            >
              {showOldPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {securityErrors.oldPassword && (
            <p className="text-sm text-destructive">
              {securityErrors.oldPassword}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label
            htmlFor="newPassword"
            className="block text-sm font-semibold text-foreground"
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
              className={`w-full px-3 py-2 pr-10 rounded-md border
              bg-background text-foreground
              focus:outline-none focus:ring-2 focus:ring-ring
              ${
                securityErrors.newPassword
                  ? "border-destructive"
                  : "border-input"
              }`}
              disabled={isSecuritySubmitting}
            />

            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2
              text-muted-foreground hover:text-foreground
              transition-colors"
            >
              {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {securityErrors.newPassword && (
            <p className="text-sm text-destructive">
              {securityErrors.newPassword}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-foreground"
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
              className={`w-full px-3 py-2 pr-10 rounded-md border
              bg-background text-foreground
              focus:outline-none focus:ring-2 focus:ring-ring
              ${
                securityErrors.confirmPassword
                  ? "border-destructive"
                  : "border-input"
              }`}
              disabled={isSecuritySubmitting}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2
              text-muted-foreground hover:text-foreground
              transition-colors"
            >
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {securityErrors.confirmPassword && (
            <p className="text-sm text-destructive">
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
