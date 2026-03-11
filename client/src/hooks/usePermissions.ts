import { useAppContext } from "./useAppContext";

export const useHasPermission = (permission: string): boolean => {
  const { user } = useAppContext();
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return (user.permissions ?? []).includes(permission);
};
