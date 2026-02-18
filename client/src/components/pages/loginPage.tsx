import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../../context";

interface LoginFormData {
  userEmail: string;
  userPassword: string;
  rememberMe: boolean;
}

interface FormErrors {
  userEmail?: string;
  userPassword?: string;
  submit?: string;
}

/**
 * LoginPage Component
 * Route: /login
 * Purpose: User authentication login form
 * Features:
 * - Email and password input fields
 * - Form validation
 * - Remember me option
 * - Link to signup page
 * - Password visibility toggle
 * - Loading state during submission
 */
function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [formData, setFormData] = useState<LoginFormData>({
    userEmail: "",
    userPassword: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.userEmail) {
      newErrors.userEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = "Please enter a valid email";
    }

    if (!formData.userPassword) {
      newErrors.userPassword = "Password is required";
    } else if (formData.userPassword.length < 6) {
      newErrors.userPassword = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      // Call real login API
      await login(formData.userEmail, formData.userPassword);

      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem(
          "rememberMe",
          JSON.stringify({
            email: formData.userEmail,
            timestamp: Date.now(),
          }),
        );
      } else {
        localStorage.removeItem("rememberMe");
      }

      // Navigate to home page
      navigate("/home");
    } catch (error: any) {
      console.error("Login error:", error);
      setErrors({ 
        submit: error?.response?.data?.message || error?.message || "Login failed. Please check your credentials and try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
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
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
        >
          {/* Submit Error Alert */}
          {errors.submit && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="userEmail"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="userEmail"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                errors.userEmail
                  ? "border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                  : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
              } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500`}
            />
            {errors.userEmail && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                {errors.userEmail}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="userPassword"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="userPassword"
                name="userPassword"
                value={formData.userPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  errors.userPassword
                    ? "border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
                } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-10`}
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
            {errors.userPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                {errors.userPassword}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Remember me
              </span>
            </label>
            <a
              href="#"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign in"
            )}
          </button>

          {/* Signup Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              Create one now
            </Link>
          </p>
        </form>

        {/* Footer Info */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
