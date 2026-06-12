"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { signupAction } from "../../../actions/auth.actions";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export const SignupForm = () => {
  const router = useRouter();
  const { setUser } = useAppStore();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("confirmPassword", confirmPassword);

        const res = await signupAction(null, formData);

        if (res.success && res.data) {
          setUser(res.data);
          toast.success(res.message || "Account created! Please verify your email.");
          router.push("/verify-email");
        } else {
          setError(res.message || "Signup failed. Please try again.");
          toast.error(res.message || "Signup failed.");
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
        toast.error("An error occurred. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
      {/* {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium tracking-wide">
          {error}
        </div>
      )} */}

      <Input
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isPending}
        required
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="john@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isPending}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isPending}
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isPending}
        required
      />

      <Button variant="primary" type="submit" className="w-full mt-2" isLoading={isPending}>
        Create Account
      </Button>

      <div className="text-center text-xs text-[#737373] tracking-wide mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-black font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
};
export default SignupForm;
