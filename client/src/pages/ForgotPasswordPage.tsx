import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Mail,
  Lock,
} from "lucide-react";
import OTPInput from "@/components/auth/OTPInput";
import authService from "@/services/authService";
import RightPanel from "@/components/auth/rightPanel";

type Step = "email" | "otp" | "reset" | "success";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [timer, setTimer] = useState(0);

  // OTP timer countdown
  useEffect(() => {
    if (otpExpiry <= 0) return;

    const interval = setInterval(() => {
      setOtpExpiry((prev) => {
        const newTime = prev - 1;
        setTimer(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiry]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const validateEmail = (email: string): boolean => {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return EMAIL_REGEX.test(email);
  };

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await authService.requestPasswordResetOTP(email);
      setSuccess("OTP sent to your email address");
      // For demo: set a fixed expiry time (5 minutes)
      setOtpExpiry(300);
      setTimer(300);
      setStep("otp");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to send OTP";
      setError(errorMsg || "Unable to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyPasswordResetOTP(email, otp);
      setResetToken(response.resetToken);
      setSuccess(response.message);
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Password must contain uppercase, lowercase, number, and special character (@$!%*?&), minimum 8 characters",
      );
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must contain uppercase, lowercase, number, and special character",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(resetToken, newPassword);
      setSuccess(response.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-background">
      {/* LEFT COLUMN - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Back Button */}
          {step !== "success" && (
            <button
              onClick={() => {
                if (step === "otp") {
                  setStep("email");
                  setOtp("");
                  setOtpExpiry(0);
                  setError("");
                } else if (step === "reset") {
                  setStep("otp");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                } else {
                  navigate("/login");
                }
              }}
              className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}

          {/* Header Section */}
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
              {step === "email" && "Reset Password"}
              {step === "otp" && "Verify OTP"}
              {step === "reset" && "Create New Password"}
              {step === "success" && "Success!"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {step === "email" &&
                "Enter your email to receive a password reset OTP"}
              {step === "otp" && "Enter the 6-digit OTP sent to your email"}
              {step === "reset" && "Create a strong password for your account"}
              {step === "success" &&
                "Your password has been reset successfully"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-300">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* STEP 1: Email Input */}
          {step === "email" && (
            <form
              onSubmit={handleRequestOTP}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="h-11 pl-10 rounded-lg border border-input bg-card hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>

              <p className="text-center text-muted-foreground text-sm">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === "otp" && (
            <form
              onSubmit={handleVerifyOTP}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">
                    Enter 6-Digit OTP
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Sent to <strong>{email}</strong>
                  </p>
                </div>

                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                />

                <div className="text-center">
                  {otpExpiry > 0 ? (
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      Expires in:{" "}
                      <span className="font-bold">{formatTime(timer)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      OTP has expired
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6 || otpExpiry <= 0}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </form>
          )}

          {/* STEP 3: Password Reset */}
          {step === "reset" && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-sm font-semibold"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={loading}
                      className="h-11 pl-10 rounded-lg border border-input bg-card hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      disabled={loading}
                      className="h-11 pl-10 rounded-lg border border-input bg-card hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-sm bg-secondary/20 dark:bg-secondary/10 p-4 rounded-lg border border-secondary">
                <p className="font-semibold text-foreground mb-3">
                  Password Requirements:
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Minimum 8 characters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>At least one uppercase letter (A-Z)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>At least one lowercase letter (a-z)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>At least one number (0-9)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>At least one special character (@$!%*?&)</span>
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          {/* STEP 4: Success State */}
          {step === "success" && (
            <div className="space-y-6">
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-8 text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Password Reset Complete
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your password has been successfully reset. You can now sign in
                  with your new password.
                </p>
              </div>

              <Button
                onClick={() => navigate("/login")}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN - Illustration Background */}
      <RightPanel />
    </div>
  );
}

export default ForgotPasswordPage;
