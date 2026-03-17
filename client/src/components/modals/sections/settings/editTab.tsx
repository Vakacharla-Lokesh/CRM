import React from "react";
import { FormField } from "@/components/modals/form-fields";
import { ErrorAlert, ModalFooter } from "@/components/modals/shared";

function EditTab({
  profileData,
  setProfileData,
  profileErrors,
  isProfileSubmitting,
  handleProfileSubmit,
  profileSubmitError,
  profileSuccess,
  handleClose,
}: {
  profileData: { firstName: string; lastName: string };
  setProfileData: React.Dispatch<
    React.SetStateAction<{ firstName: string; lastName: string }>
  >;
  profileErrors: Record<string, string>;
  isProfileSubmitting: boolean;
  handleProfileSubmit: (e: React.FormEvent) => void;
  profileSubmitError: string | null;
  profileSuccess: string | null;
  handleClose: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Edit Profile
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Update your display name
        </p>
      </div>

      <form
        onSubmit={handleProfileSubmit}
        className="space-y-4"
      >
        {profileSubmitError && <ErrorAlert message={profileSubmitError} />}
        {profileSuccess && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-600 dark:text-green-400">
              {profileSuccess}
            </p>
          </div>
        )}

        <FormField
          id="firstName"
          label="First Name"
          value={profileData.firstName}
          onChange={(value) =>
            setProfileData({ ...profileData, firstName: value })
          }
          placeholder="Enter first name"
          required
          error={profileErrors.firstName}
          disabled={isProfileSubmitting}
        />
        <FormField
          id="lastName"
          label="Last Name"
          value={profileData.lastName}
          onChange={(value) =>
            setProfileData({ ...profileData, lastName: value })
          }
          placeholder="Enter last name"
          error={profileErrors.lastName}
          disabled={isProfileSubmitting}
        />

        <ModalFooter
          onCancel={handleClose}
          isSubmitting={isProfileSubmitting}
          submitLabel="Save Changes"
        />
      </form>
    </div>
  );
}

export default EditTab;
