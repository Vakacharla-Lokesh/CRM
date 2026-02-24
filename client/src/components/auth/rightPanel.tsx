import { Lock } from "lucide-react";
import React from "react";

function RightPanel() {
  return (
    <div className="hidden lg:flex flex-1 bg-linear-to-br from-primary via-primary/80 to-primary/60 items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 text-center space-y-6 px-8">
        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-8 mb-6">
          <Lock className="w-24 h-24 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-white">Secure Password Reset</h3>
        <p className="text-white/80 max-w-sm mx-auto">
          Your account security is our top priority. Reset your password safely
          and securely.
        </p>
      </div>
    </div>
  );
}

export default RightPanel;
