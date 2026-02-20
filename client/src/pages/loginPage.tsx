import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context";
import { useForm } from "../hooks";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormData {
  userEmail: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  userEmail?: string;
  password?: string;
  submit?: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (values: LoginFormData): FormErrors => {
    const errors: FormErrors = {};

    if (!values.userEmail) {
      errors.userEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.userEmail)) {
      errors.userEmail = "Please enter a valid email";
    }

    if (!values.password) {
      errors.password = "Password is required";
    } else if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return errors;
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: onSubmit,
    setFieldValue,
  } = useForm<LoginFormData>(
    {
      userEmail: "",
      password: "",
      rememberMe: false,
    },
    async (values: LoginFormData) => {
      try {
        // Call real login API
        await login(values.userEmail, values.password);

        // Store remember me preference
        if (values.rememberMe) {
          localStorage.setItem(
            "rememberMe",
            JSON.stringify({
              email: values.userEmail,
              timestamp: Date.now(),
            }),
          );
        } else {
          localStorage.removeItem("rememberMe");
        }

        // Navigate to dashboard page
        navigate("/dashboard");
      } catch (error: unknown) {
        console.error("Login error:", error);
        const err = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        throw new Error(
          err?.response?.data?.message ||
            err?.message ||
            "Login failed. Please check your credentials and try again.",
        );
      }
    },
    validateForm,
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/crm.png"
              alt="Campaign Flux Logo"
              className="h-12"
            />
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Campaign Flux
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Welcome back! Please login to your account
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl shadow-xl p-8 space-y-6"
        >
          {/* Submit Error Alert */}
          {errors.submit && (
            <div className="p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="userEmail">Email Address</Label>
            <Input
              type="email"
              id="userEmail"
              name="userEmail"
              value={values.userEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              aria-invalid={!!errors.userEmail}
              className="h-10"
            />
            {errors.userEmail && (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {errors.userEmail}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className="h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={values.rememberMe}
                onCheckedChange={(checked) =>
                  setFieldValue("rememberMe", checked)
                }
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Remember me
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
