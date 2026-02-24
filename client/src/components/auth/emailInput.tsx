import React from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Loader2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

function EmailInput({
  email,
  setEmail,
  loading,
  handleRequestOTP,
}: {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  handleRequestOTP: (e: React.FormEvent) => void;
}) {
  const navigate = useNavigate();

  return (
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
  );
}

export default EmailInput;
