import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
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

import type {
  UserFormData,
  UserFormErrors as FormErrors,
  UserModalProps,
} from "@/types/interfaces/form-interfaces";
import { useParams } from "react-router-dom";
import { validateUserForm } from "@/utils/formValidators";
import { useOffline } from "@/context/useOffline";
import { toast } from "sonner";

import { useRoles } from "@/hooks/useRoles";

function UserModal({ isOpen, user, onClose, onSave }: UserModalProps) {
  const { user: currentUser } = useAppContext();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const { id } = useParams();
  const { isOnline, addToQueue } = useOffline();

  const [formData, setFormData] = useState<UserFormData>(
    user
      ? {
          firstName: user.firstName,
          lastName: user.lastName || "",
          email: user.email,
          mobile: user.mobile || "",
          role: user.role,
          roleId: user.roleId ?? "",
          password: "",
          tenantId: user.tenantId,
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          role: "user",
          roleId: "",
          password: "",
          tenantId: isSuperAdmin ? String(id) : currentUser?.tenantId || "",
        },
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: tenantRoles = [] } = useRoles();

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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    if (!isOnline) {
      if (user) {
        toast.error(
          "Updating a user requires an internet connection. Please try again when online.",
        );
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

      toast.info(
        "You're offline. User has been queued and will sync automatically when your connection is restored.",
      );
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
      };

      await onSave(userData);
      onClose();
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error saving user:", error);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {user ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update the user information below."
              : "Fill in the details to create a new user."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 py-4"
        >
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
              value={formData.roleId || formData.role}
              onChange={(value) => {
                // value is either a tenant role _id or a fallback system role string
                const matchedRole = tenantRoles.find((r) => r._id === value);
                if (matchedRole) {
                  // Map role name to system role enum — fallback to "user"
                  const systemRole =
                    matchedRole.name.toLowerCase() === "admin"
                      ? "admin"
                      : matchedRole.name.toLowerCase() === "super_admin"
                        ? "super_admin"
                        : "user";
                  setFormData((prev) => ({
                    ...prev,
                    role: systemRole as UserFormData["role"],
                    roleId: matchedRole._id,
                  }));
                } else {
                  // Fallback: treat as plain system role string
                  handleInputChange("role", value);
                }
              }}
              placeholder="Select role"
              required
              options={
                tenantRoles.length > 0
                  ? tenantRoles.map((r) => ({
                      value: r._id,
                      label: (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span>{r.name}</span>
                        </div>
                      ),
                    }))
                  : [
                      {
                        value: "user",
                        label: (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                            <span>User</span>
                          </div>
                        ),
                      },
                      {
                        value: "admin",
                        label: (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
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
                placeholder="Enter password (min. 6 characters)"
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
