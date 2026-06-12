"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyOtpAction, resendOtpAction, logoutAction } from "../../../actions/auth.actions";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/common/Button";

export function VerifyEmailForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const [isVerifying, startVerifyTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const [isLoggingOut, startLogoutTransition] = useTransition();
  
  const { user, setUser } = useAppStore();

  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    if (!user?.email) {
      toast.error("User email not found. Please log in again.");
      router.push("/login");
      return;
    }

    startVerifyTransition(async () => {
      try {
        const res = await verifyOtpAction(user.email, code);
        if (res.success && res.data) {
          setUser(res.data);
          toast.success("Identity verified successfully!");
          router.push("/dashboard");
          router.refresh();
        } else {
          toast.error(res.message || "Invalid or expired verification code.");
        }
      } catch (error) {
        toast.error("An error occurred during verification. Please try again.");
      }
    });
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    if (!user?.email) {
      toast.error("User email not found. Please log in again.");
      router.push("/login");
      return;
    }
    
    startResendTransition(async () => {
      try {
        const res = await resendOtpAction(user.email);
        if (res.success) {
          toast.success("Verification code sent to your email.");
          setResendTimer(60);
        } else {
          toast.error(res.message || "Failed to resend code.");
        }
      } catch (error) {
        toast.error("Failed to resend code. Please try again.");
      }
    });
  };

  const handleLogout = async () => {
    startLogoutTransition(async () => {
      await logoutAction();
      setUser(null);
      router.push("/login");
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="flex justify-between gap-2.5" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              autoFocus={index === 0}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-bold rounded-2xl border border-[#e5e5e7] bg-[#f5f5f7] text-black focus:border-black focus:bg-white outline-none transition-all"
              disabled={isVerifying || isResending}
            />
          ))}
        </div>

        <Button 
          variant="primary" 
          type="submit" 
          className="w-full" 
          isLoading={isVerifying}
          disabled={isResending || isLoggingOut}
        >
          Confirm Verification
        </Button>
      </form>

      {/* Footer Actions */}
      <div className="text-center space-y-4 mt-2">
        <div className="text-xs text-[#737373] tracking-wide">
          Didn&apos;t receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={resendTimer > 0 || isResending || isVerifying}
            className={`font-semibold hover:underline transition-colors ${
              resendTimer > 0 
                ? "text-slate-400 cursor-not-allowed" 
                : "text-black cursor-pointer"
            }`}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Now"}
          </button>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut || isVerifying}
          className="text-xs text-[#737373] hover:text-black font-semibold transition-colors cursor-pointer hover:underline disabled:opacity-50 block mx-auto mt-2"
        >
          Back to Login / Change Email
        </button>
      </div>
    </div>
  );
}
