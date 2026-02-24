import React from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { OTPInput } from "./OTPInput";
import { Loader2 } from "lucide-react";

function OTPVerification({
  email,
  otp,
  setOtp,
  handleVerifyOTP,
  loading,
  timer,
  otpExpiry,
}: {
  email: string;
  otp: string;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  handleVerifyOTP: (e: React.FormEvent) => void;
  loading: boolean;
  timer: number;
  otpExpiry: number;
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  return (
    <form
      onSubmit={handleVerifyOTP}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-semibold">Enter 6-Digit OTP</Label>
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
              Expires in: <span className="font-bold">{formatTime(timer)}</span>
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
  );
}

export default OTPVerification;
