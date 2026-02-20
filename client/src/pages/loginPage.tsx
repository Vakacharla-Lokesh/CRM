import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context";
import { useForm } from "../hooks";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";

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
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M15.171 11.586a4 4 0 111.414-1.414l1.473 1.473a10.014 10.014 0 01-1.488 2.316l1.78 1.781a9.958 9.958 0 01-4.512 1.074c-4.478 0-8.268-2.943-9.542-7a9.968 9.968 0 011.441-2.261l1.473 1.473z" />
                  </svg>
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
