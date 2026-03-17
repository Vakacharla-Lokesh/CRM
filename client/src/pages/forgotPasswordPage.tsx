import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import authService from "@/services/authService";
import RightPanel from "@/components/auth/rightPanel";
import EmailInput from "@/components/auth/emailInput";
import OTPVerification from "@/components/auth/otpVerification";
import PasswordReset from "@/components/auth/passwordReset";

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
            <EmailInput
              handleRequestOTP={handleRequestOTP}
              email={email}
              setEmail={setEmail}
              loading={loading}
            />
          )}

          {/* STEP 2: OTP Verification */}
          {step === "otp" && (
            <OTPVerification
              email={email}
              otp={otp}
              setOtp={setOtp}
              handleVerifyOTP={handleVerifyOTP}
              loading={loading}
              timer={timer}
              otpExpiry={otpExpiry}
            />
          )}

          {/* STEP 3: Password Reset */}
          {step === "reset" && (
            <PasswordReset
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              setNewPassword={setNewPassword}
              setConfirmPassword={setConfirmPassword}
              handleResetPassword={handleResetPassword}
              loading={loading}
            />
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
