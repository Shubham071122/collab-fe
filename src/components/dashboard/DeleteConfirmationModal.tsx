"use client";

import React from "react";
import { Button } from "@/components/common/Button";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName?: string;
  isPending?: boolean;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  isPending = false,
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/10 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[400px] bg-white border border-[#e5e5e7] rounded-3xl p-8 shadow-[0_30px_70px_rgba(0,0,0,0.08)] relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-5 right-5 text-[#737373] hover:text-black p-1.5 hover:bg-[#f5f5f7] rounded-full transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center text-black mb-4">
            <AlertTriangle size={20} className="stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-semibold text-black tracking-tight mb-2">
            Delete Project
          </h2>
          <p className="text-xs text-[#737373] tracking-wide leading-relaxed max-w-[280px]">
            Are you sure you want to delete <span className="font-semibold text-black">"{projectName || "this project"}"</span>? This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isPending}
            className="w-full bg-black text-white hover:bg-black/90"
          >
            Delete Project
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
