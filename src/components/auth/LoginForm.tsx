"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { loginAction } from "../../../actions/auth.actions";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export const LoginForm = () => {
  const router = useRouter();
  const { setUser } = useAppStore();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setError("");

    let hasError = false;
    if (!email) {
      setEmailError("Email address is required.");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    }

    if (hasError) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("rememberMe", "false");

        const res = await loginAction(null, formData);

        if (res.success && res.data) {
          setUser(res.data);
          toast.success(res.message || "Logged in successfully!");
          router.push("/dashboard");
        } else {
          setPasswordError(res.message || "Invalid email or password.");
          toast.error(res.message || "Login failed.");
        }
      } catch (err) {
        setError("An unexpected network error occurred.");
        toast.error("An error occurred during login.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6" noValidate>
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium tracking-wide animate-fade-in">
          {error}
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError("");
        }}
        disabled={isPending}
        error={emailError}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (passwordError) setPasswordError("");
        }}
        disabled={isPending}
        error={passwordError}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#737373] font-medium tracking-wide">
        </label>
        <span className="text-xs text-[#737373] hover:text-black transition-colors cursor-pointer font-medium select-none">
          Forgot Password?
        </span>
      </div>

      <Button variant="primary" type="submit" className="w-full mt-2" isLoading={isPending}>
        Sign In
      </Button>

      <div className="text-center text-xs text-[#737373] tracking-wide mt-4">
        New to Collab?{" "}
        <Link href="/signup" className="text-black font-semibold hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  );
};
export default LoginForm;
