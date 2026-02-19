import { useState, useEffect, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, UserRole, CreateUserDTO } from "@/types";

interface UserFormData {
  firstName: string;
  lastName: string;
  userEmail: string;
  mobile: string;
  role: UserRole;
  userPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  userEmail?: string;
  mobile?: string;
  userPassword?: string;
}

interface UserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userData: CreateUserDTO) => Promise<void>;
}

function UserModal({ isOpen, user, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    userEmail: "",
    mobile: "",
    role: "user",
    userPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName || "",
        userEmail: user.userEmail,
        mobile: user.mobile || "",
        role: user.role,
        userPassword: "", // Don't show password for existing users
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        userEmail: "",
        mobile: "",
        role: "user",
        userPassword: "",
      });
    }
    setErrors({});
  }, [user, isOpen]);

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
    if (!user && !formData.userPassword.trim()) {
      newErrors.userPassword = "Password is required for new users";
    } else if (formData.userPassword && formData.userPassword.length < 6) {
      newErrors.userPassword = "Password must be at least 6 characters";
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
        userPassword: formData.userPassword,
        mobile: formData.mobile || undefined,
        role: formData.role,
        tenantId: "tenant-1", // Must use actual tenant ID in real implementation
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-semibold"
              >
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="John"
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-semibold"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="userEmail"
              className="text-sm font-semibold"
            >
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="userEmail"
              type="email"
              value={formData.userEmail}
              onChange={(e) => handleInputChange("userEmail", e.target.value)}
              placeholder="john.doe@example.com"
              className={errors.userEmail ? "border-red-500" : ""}
            />
            {errors.userEmail && (
              <p className="text-sm text-red-500">{errors.userEmail}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="mobile"
                className="text-sm font-semibold"
              >
                Mobile Number
              </Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                placeholder="9876543210"
                className={errors.mobile ? "border-red-500" : ""}
              />
              {errors.mobile && (
                <p className="text-sm text-red-500">{errors.mobile}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm font-semibold"
              >
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <span>User</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!user && (
            <div className="space-y-2">
              <Label
                htmlFor="userPassword"
                className="text-sm font-semibold"
              >
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="userPassword"
                type="password"
                value={formData.userPassword}
                onChange={(e) =>
                  handleInputChange("userPassword", e.target.value)
                }
                placeholder="Enter password (min. 6 characters)"
                className={errors.userPassword ? "border-red-500" : ""}
              />
              {errors.userPassword && (
                <p className="text-sm text-red-500">{errors.userPassword}</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{user ? "Update User" : "Create User"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserModal;
