"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, disabled, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-black/75 tracking-wider capitalize select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            "w-full px-3.5 py-2.5 text-sm bg-white text-black border border-[#e5e5e7] rounded-lg transition-all duration-200 outline-none placeholder:text-black/30",
            "focus:border-black/40 focus:ring-1 focus:ring-black/10 focus:shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
            "disabled:opacity-50 disabled:bg-[#f5f5f7] disabled:cursor-not-allowed",
            error && "border-red-500 focus:border-red-500 focus:ring-red-100",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500 tracking-wide mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
