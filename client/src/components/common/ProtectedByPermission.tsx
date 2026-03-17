import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";

interface ProtectedByPermissionProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const ProtectedByPermission = ({
  permission,
  fallback = null,
  children,
}: ProtectedByPermissionProps) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
