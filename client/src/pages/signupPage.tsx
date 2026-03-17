import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "@/hooks";
import {
  getPasswordStrength,
  validateSignupForm,
} from "../utils/formValidators";
import type { SignupFormData, SignupFormErrors } from "../utils/formValidators";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Eye, EyeOff } from "lucide-react";

type FormErrors = SignupFormErrors;

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAppContext();
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = validateSignupForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await signup({
        firstName: formData.firstName,
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      setErrors({
        submit:
          error?.response?.data?.message ||
          error?.message ||
          "Signup failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const inputClass =
    "h-11 rounded-lg border border-input bg-card hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors";
  const inputErrorClass =
    "h-11 rounded-lg border border-red-500 dark:border-red-400 bg-card focus:ring-2 focus:ring-red-500/20 transition-colors";

  return (
    <div className="min-h-screen flex items-stretch bg-background">
      {/* LEFT COLUMN - Illustration */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-primary via-primary/80 to-primary/60 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-white">Join Campaign Flux</h3>
          <p className="text-white/80 max-w-sm mx-auto">
            Set up your organization and start managing campaigns with your team
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-12 overflow-y-auto">
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
              Create an account
            </h2>
            <p className="text-muted-foreground text-sm">
              Set up your organization to get started
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Organization Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold"
              >
                Organization Name
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Company Inc."
                aria-invalid={!!errors.name}
                className={errors.name ? inputErrorClass : inputClass}
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-semibold"
              >
                Your Full Name
              </Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John Doe"
                aria-invalid={!!errors.firstName}
                className={errors.firstName ? inputErrorClass : inputClass}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold"
              >
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                className={errors.email ? inputErrorClass : inputClass}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  className={`${errors.password ? inputErrorClass : inputClass} pr-10`}
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

              {/* Password Strength */}
              {formData.password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-colors ${
                          i < passwordStrength.level
                            ? passwordStrength.color
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      passwordStrength.level <= 2
                        ? "text-red-600 dark:text-red-400"
                        : passwordStrength.level === 3
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    Password strength: {passwordStrength.text}
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                  className={`${errors.confirmPassword ? inputErrorClass : inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => window.open("/terms", "_blank")}
                    className="text-primary font-medium hover:text-primary/80 transition-colors bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Terms and Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => window.open("/privacy", "_blank")}
                    className="text-primary font-medium hover:text-primary/80 transition-colors bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Create account"
              )}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
