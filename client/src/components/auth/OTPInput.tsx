import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function OTPInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  placeholder = "•",
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, newValue: string) => {
    // Only allow digits
    const digit = newValue.replace(/[^\d]/g, "");

    // Update the OTP value at the current index
    const otpArray = value.split("");
    otpArray[index] = digit;
    const newOTP = otpArray.join("").slice(0, length);

    onChange(newOTP);

    // Auto-focus next input if digit was entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    // Backspace: move to previous input
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const otpArray = value.split("");
        otpArray[index] = "";
        onChange(otpArray.join(""));
      }
      e.preventDefault();
    }
    // Arrow keys: navigate between inputs
    else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^\d]/g, "");
    const newOTP = pastedData.slice(0, length);
    onChange(newOTP);

    // Auto-focus to next empty input or last input
    const nextIndex = Math.min(newOTP.length, length - 1);
    setTimeout(() => {
      inputRefs.current[nextIndex]?.focus();
    }, 0);
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={placeholder}
          className="h-12 w-12 text-center text-lg font-semibold border-2 border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

export default OTPInput;
