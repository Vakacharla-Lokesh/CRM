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
import { useTenantData } from "@/hooks";
import type { CreateUserDTO } from "@/types";
import { FormField, FormSelect } from "./form-fields";
import { ModalFooter } from "./shared";

import type {
  UserFormData,
  UserFormErrors as FormErrors,
  UserModalProps,
} from "@/types/form-interfaces";

function UserModal({ isOpen, user, onClose, onSave }: UserModalProps) {
  const { user: currentUser } = useAppContext();
  const { tenants, loading: tenantsLoading } = useTenantData();
  const isSuperAdmin = currentUser?.role === "super_admin";

  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    userEmail: "",
    mobile: "",
    role: "user",
    password: "",
    tenantId: currentUser?.tenantId || "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName || "",
        userEmail: user.userEmail,
        mobile: user.mobile || "",
        role: user.role,
        password: "",
        tenantId: user.tenantId,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        userEmail: "",
        mobile: "",
        role: "user",
        password: "",
        tenantId: currentUser?.tenantId || "",
      });
    }
    setErrors({});
  }, [user, isOpen, currentUser]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.userEmail.trim()) {
      newErrors.userEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = "Invalid email format";
    }

    // Password is only required for new users
    if (!user && !formData.password.trim()) {
      newErrors.password = "Password is required for new users";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Tenant is required for super_admin users
    if (isSuperAdmin && !formData.tenantId) {
      newErrors.tenantId = "Tenant selection is required";
    }

    // Mobile validation - backend expects 10 digits starting with non-zero
    if (
      formData.mobile &&
      !/^[1-9]\d{9}$/.test(formData.mobile.replace(/[^0-9]/g, ""))
    ) {
      newErrors.mobile = "Invalid mobile number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData: CreateUserDTO = {
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        userEmail: formData.userEmail,
        password: formData.password,
        mobile: formData.mobile || undefined,
        role: formData.role,
        tenantId: formData.tenantId,
      };

      await onSave(userData);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
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
            id="userEmail"
            label="Email"
            type="email"
            value={formData.userEmail}
            onChange={(value) => handleInputChange("userEmail", value)}
            placeholder="john.doe@example.com"
            required
            error={errors.userEmail}
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
              onChange={(value) => handleInputChange("role", value)}
              placeholder="Select role"
              required
              options={[
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
              ]}
            />
          </div>

          {isSuperAdmin && (
            <FormSelect
              id="tenantId"
              label="Tenant"
              value={formData.tenantId}
              onChange={(value) => handleInputChange("tenantId", value)}
              placeholder={
                tenantsLoading ? "Loading tenants..." : "Select tenant"
              }
              required
              error={errors.tenantId}
              disabled={tenantsLoading}
              options={tenants.map((tenant) => ({
                value: tenant._id,
                label: (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>{tenant.tenantName}</span>
                  </div>
                ),
              }))}
            />
          )}

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
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
