import { useState, useEffect, type FormEvent } from "react";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppContext } from "@/hooks";
import type { CreateUserDTO } from "@/types";
import { FormField, FormSelect } from "./form-fields";
import { ModalFooter } from "./shared";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type {
  UserFormData,
  UserFormErrors as FormErrors,
  UserModalProps,
} from "@/types/interfaces/form-interfaces";
import { useParams } from "react-router-dom";
import { validateUserForm } from "@/utils/formValidators";
import { useOffline } from "@/context/useOffline";
import { toast } from "sonner";

import { useRoles } from "@/hooks/roles/useRoles";
import { usersAPI } from "@/services/api/users.api";
import { PERMISSION_MAP } from "@/types/constants/permissions";
import { useQuery } from "@tanstack/react-query";
import { normalizePermissions } from "@/utils/format";

function UserModal({ isOpen, user, onClose, onSave }: UserModalProps) {
  const { user: currentUser } = useAppContext();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const isAdmin = currentUser?.role === "admin";
  const canEditPermissions = isSuperAdmin || isAdmin;
  const { id } = useParams();
  const { isOnline, addToQueue } = useOffline();

  const buildDefault = (): UserFormData => ({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    mobile: user?.mobile ?? "",
    role: user?.role ?? "user",
    password: "",
    tenantId:
      user?.tenantId ??
      (isSuperAdmin ? String(id) : (currentUser?.tenantId ?? "")),
    permissions: normalizePermissions(user?.permissions),
  });

  const [formData, setFormData] = useState<UserFormData>(buildDefault);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  // For super_admins creating/editing a user in another tenant, fetch that tenant's roles
  const targetTenantId = isSuperAdmin && id ? id : undefined;
  const { data: tenantRoles = [] } = useRoles(targetTenantId);

  // Fetch existing user permissions when editing
  const { data: existingPermsData } = useQuery({
    queryKey: ["user-permissions", user?._id],
    queryFn: () => usersAPI.getPermissions(user!._id),
    enabled: !!user?._id && canEditPermissions && isOpen,
    staleTime: 0,
  });

  // Seed permissions from API when they arrive
  useEffect(() => {
    if (existingPermsData?.permissions) {
      setFormData((prev) => ({
        ...prev,
        permissions: normalizePermissions(existingPermsData.permissions),
      }));
    }
  }, [existingPermsData]);

  // When tenant roles load, try to resolve role name
  useEffect(() => {
    // attempt to initialize the role when editing a user and tenant roles are available
    if (!isOpen) return;
    if (!user) return;
    setFormData((prev) => {
      // If role is already set to something from tenantRoles, keep it
      if (
        tenantRoles.some((r) =>
          r.name?.toLowerCase() === prev.role?.toLowerCase(),
        )
      ) {
        return prev;
      }

      // try match user's role by name (case-insensitive)
      if (user?.role) {
        const matchedRole = tenantRoles.find(
          (r) => r.name?.toLowerCase() === user.role?.toLowerCase(),
        );
        if (matchedRole) {
          return {
            ...prev,
            role: matchedRole.name as UserFormData["role"],
            permissions: prev.permissions?.length
              ? prev.permissions
              : matchedRole.permissions,
          };
        }
        // User's custom role not in tenantRoles, keep the original
        return {
          ...prev,
          role: user.role as UserFormData["role"],
        };
      }

      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantRoles, user, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData(buildDefault());
      setErrors({});
      setShowPassword(false);
      setExpandedCategories({});
    } else {
      // keep a clean state when fully closed
      setFormData(buildDefault());
      setErrors({});
      setShowPassword(false);
      setExpandedCategories({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const validateForm = (): boolean => {
    const newErrors = validateUserForm(formData, {
      isExistingUser: !!user,
      isSuperAdmin,
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    if (!isOnline) {
      if (user) {
        toast.error("Updating a user requires an internet connection.");
        setIsSubmitting(false);
        return;
      }
      const userData: CreateUserDTO = {
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile || undefined,
        role: formData.role,
        tenantId: formData.tenantId,
        permissions: normalizePermissions(formData.permissions).reduce(
          (acc, p) => ({ ...acc, [p]: true }),
          {} as Record<string, boolean>,
        ),
      };
      addToQueue(
        "/api/users",
        "POST",
        userData,
        undefined,
        3,
        "users",
        "create",
      );
      toast.info("You're offline. User queued for sync.");
      onClose();
      setIsSubmitting(false);
      return;
    }

    try {
      const userData: CreateUserDTO = {
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile || undefined,
        role: formData.role,
        tenantId: formData.tenantId,
        permissions: normalizePermissions(formData.permissions).reduce(
          (acc, p) => ({ ...acc, [p]: true }),
          {} as Record<string, boolean>,
        ),
      };

      await onSave(userData);

      if (user && canEditPermissions) {
        const perms = normalizePermissions(formData.permissions);
        if (perms.length > 0) {
          try {
            await usersAPI.assignRole(user._id, {
              permissions: perms,
              role: formData.role,
            });
          } catch (err) {
            toast.error("User saved but permissions update failed.");
            console.error(err);
          }
        }
      }

      onClose();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to save user. Please try again.";
      toast.error(message);
      console.error("Error saving user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => {
      const current = normalizePermissions(prev.permissions);
      const updated = current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission];
      return { ...prev, permissions: updated };
    });
  };

  const toggleCategory = (_category: string, perms: string[]) => {
    setFormData((prev) => {
      const current = normalizePermissions(prev.permissions);
      const allSelected = perms.every((p) => current.includes(p));
      const updated = allSelected
        ? current.filter((p) => !perms.includes(p))
        : [...new Set([...current, ...perms])];
      return { ...prev, permissions: updated };
    });
  };

  const toggleCategoryExpand = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const currentPermissions = normalizePermissions(formData.permissions);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {user ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update the user information and permissions below."
              : "Fill in the details to create a new user."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 py-4"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={(value) => handleInputChange("firstName", value)}
              placeholder="John"
              required
              error={errors.firstName}
            />
            <FormField
              id="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={(value) => handleInputChange("lastName", value)}
              placeholder="Doe"
            />
          </div>

          <FormField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange("email", value)}
            placeholder="john.doe@example.com"
            required
            error={errors.email}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="mobile"
              label="Mobile Number"
              type="tel"
              value={formData.mobile}
              onChange={(value) => handleInputChange("mobile", value)}
              placeholder="9876543210"
              error={errors.mobile}
            />

            <FormSelect
              id="role"
              label="Role"
              value={formData.role}
              onChange={(value) => {
                const matchedRole = tenantRoles.find(
                  (r) => r.name?.toLowerCase() === value.toLowerCase(),
                );
                if (matchedRole) {
                  setFormData((prev) => ({
                    ...prev,
                    role: matchedRole.name as UserFormData["role"],
                    permissions: matchedRole.permissions,
                  }));
                } else {
                  // value is a custom role string like 'Manager', 'user', or 'admin'
                  setFormData((prev) => ({
                    ...prev,
                    role: value as UserFormData["role"],
                  }));
                }
              }}
              placeholder="Select role"
              required
              options={
                tenantRoles.length > 0
                  ? tenantRoles.map((r) => ({
                      value: r.name,
                      label: (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>{r.name}</span>
                        </div>
                      ),
                    }))
                  : [
                      {
                        value: "user",
                        label: (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-500" />
                            <span>User</span>
                          </div>
                        ),
                      },
                      {
                        value: "admin",
                        label: (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>Admin</span>
                          </div>
                        ),
                      },
                    ]
              }
            />
          </div>

          {!user && (
            <div className="relative">
              <FormField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(value) => handleInputChange("password", value)}
                placeholder="Enter password (min. 8 characters)"
                required
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          {/* Permissions Editor — admin/super_admin only, edit mode only (or create if admin) */}
          {canEditPermissions && (user || isAdmin || isSuperAdmin) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Permissions
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {currentPermissions.length} permission
                    {currentPermissions.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        permissions: Object.values(PERMISSION_MAP).flat(),
                      }))
                    }
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, permissions: [] }))
                    }
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                {Object.entries(PERMISSION_MAP).map(([category, perms]) => {
                  const selectedCount = perms.filter((p) =>
                    currentPermissions.includes(p),
                  ).length;
                  const allSelected = selectedCount === perms.length;
                  const isExpanded = expandedCategories[category] ?? false;

                  return (
                    <div key={category}>
                      {/* Category header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                        <Checkbox
                          id={`cat-${category}`}
                          checked={allSelected}
                          onCheckedChange={() =>
                            toggleCategory(category, perms)
                          }
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <button
                          type="button"
                          className="flex-1 flex items-center justify-between text-left"
                          onClick={() => toggleCategoryExpand(category)}
                        >
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`cat-${category}`}
                              className="text-sm font-medium cursor-pointer text-gray-800 dark:text-gray-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {category}
                            </Label>
                            <Badge
                              variant={
                                selectedCount > 0 ? "default" : "secondary"
                              }
                              className="text-xs px-1.5 py-0"
                            >
                              {selectedCount}/{perms.length}
                            </Badge>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Individual permissions */}
                      {isExpanded && (
                        <div className="px-4 py-2 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white dark:bg-gray-900">
                          {perms.map((perm) => {
                            const isChecked = currentPermissions.includes(perm);
                            const [, action] = perm.split(":");
                            const label = action
                              ?.replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase());
                            return (
                              <div
                                key={perm}
                                className="flex items-center gap-2 py-1"
                              >
                                <Checkbox
                                  id={perm}
                                  checked={isChecked}
                                  onCheckedChange={() => togglePermission(perm)}
                                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <Label
                                  htmlFor={perm}
                                  className="text-xs cursor-pointer text-gray-700 dark:text-gray-300"
                                >
                                  {label}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <ModalFooter
            onCancel={onClose}
            isSubmitting={isSubmitting}
            submitLabel={user ? "Update User" : "Create User"}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserModal;
