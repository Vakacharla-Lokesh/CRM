import { User, Pencil, Shield } from "lucide-react";

export type Tab = "profile" | "edit" | "security";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "edit", label: "Edit Profile", icon: <Pencil size={16} /> },
  { id: "security", label: "Security", icon: <Shield size={16} /> },
];
