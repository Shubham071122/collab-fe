"use client";

import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { useAppStore } from "@/lib/store";
import Link from "next/link";

export default function VerifyEmailPage() {
  const { user } = useAppStore();

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7] text-black">
      <main className="flex-grow flex flex-col items-center justify-center py-16 px-6">
        <Link href="/" className="flex items-center gap-2.5 group mb-8">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute top-0 left-0 w-[18px] h-[18px] rounded-full border-[1.5px] border-black bg-white transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            <div className="absolute bottom-0 right-0 w-[18px] h-[18px] rounded-full bg-black border border-black transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight leading-none">
            Collab
          </span>
        </Link>
        <div className="w-full max-w-[440px] bg-white border border-[#e5e5e7] rounded-3xl p-8 sm:p-10 shadow-[0_24px_50px_-15px_rgba(0,0,0,0.03)] animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-black mb-2">
              Verify your email
            </h1>
            <p className="text-xs text-[#737373] tracking-wide mb-1">
              We sent a 6-digit verification code to
            </p>
            <p className="text-xs font-semibold text-black tracking-wide truncate">
              {user?.email || "your registered email"}
            </p>
          </div>
          <VerifyEmailForm />
        </div>
      </main>
    </div>
  );
}
