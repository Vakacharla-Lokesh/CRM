import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import InfoTab from "@/components/modals/sections/settings/infoTab";
import EditTab from "./sections/settings/editTab";
import SecurityTab from "./sections/settings/securityTab";
import { useSettingsModalState } from "@/hooks/useSettingsModalState";
import { navItems, type SettingsModalProps } from "@/types/constants/settings";

function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
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
  } = useSettingsModalState({ isOpen, onClose });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
    >
      <DialogContent className="p-0 gap-0 sm:max-w-2xl overflow-hidden">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <div className="flex h-130 bg-background">
          {/* Sidebar */}
          <aside className="w-48 shrink-0 border-r border-border flex flex-col pt-6 pb-4">
            <p className="px-4 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                      ? "text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:bg-secondary"
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
