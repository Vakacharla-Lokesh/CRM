import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/hooks";
import { useForm } from "../hooks";
import { validateLoginForm } from "../utils/formValidators";
import type { LoginFormData, LoginFormErrors } from "../utils/formValidators";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import LandingNavbar from "@/components/layout/landingNavbar";

type FormErrors = LoginFormErrors;

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (values: LoginFormData): FormErrors =>
    validateLoginForm(values);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: onSubmit,
  } = useForm<LoginFormData>(
    {
      userEmail: "",
      password: "",
      rememberMe: false,
    },
    async (values: LoginFormData) => {
      try {
        await login(values.userEmail, values.password);

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
    <div className="min-h-screen flex items-stretch bg-background">
      <LandingNavbar />
      {/* LEFT COLUMN - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Logo & Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/crm.png"
                alt="Campaign Flux Logo"
                className="h-10"
              />
              <h1 className="text-2xl font-bold text-primary">Campaign Flux</h1>
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Holla, Welcome Back
            </h2>
            <p className="text-muted-foreground text-sm">
              Hey, welcome back to your special place
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={onSubmit}
            className="space-y-6"
          >
            {/* Submit Error Alert */}
            {errors.submit && (
              <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="userEmail"
                className="text-sm font-semibold"
              >
                Email Address
              </Label>
              <Input
                type="email"
                id="userEmail"
                name="userEmail"
                value={values.userEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="stanley@gmail.com"
                aria-invalid={!!errors.userEmail}
                className="h-11 rounded-lg border border-input bg-card hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              {errors.userEmail && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.userEmail}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold"
              >
                Password
              </Label>
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
                  className="h-11 pr-10 rounded-lg border border-input bg-card hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN - Illustration Background */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-primary via-primary/80 to-primary/60 items-center justify-center relative overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Illustration Placeholder */}
        <div className="relative z-10 text-center space-y-6 px-8">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-8 mb-6">
            <svg
              className="w-24 h-24 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-white">Secure Login</h3>
          <p className="text-white/80 max-w-sm mx-auto">
            Your data is protected with enterprise-grade security and encryption
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
