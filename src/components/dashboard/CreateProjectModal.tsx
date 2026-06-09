"use client";

import React, { useState, useTransition } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { createProjectAction } from "../../../actions/project.actions";
import { toast } from "sonner";
import { X } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
}

export const CreateProjectModal = ({ isOpen, onClose, onSuccess }: CreateProjectModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setError("");

    if (!name.trim()) {
      setNameError("Project name is required.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createProjectAction(name, description);
        if (res.success && res.data) {
          toast.success(res.message || "Project created successfully!");
          onSuccess(res.data);
          setName("");
          setDescription("");
          onClose();
        } else {
          setError(res.message || "Failed to create project.");
          toast.error(res.message || "Failed to create project.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/10 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[480px] bg-white border border-[#e5e5e7] rounded-3xl p-8 shadow-[0_30px_70px_rgba(0,0,0,0.08)] relative animate-scale-in">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-5 right-5 text-[#737373] hover:text-black p-1.5 hover:bg-[#f5f5f7] rounded-full transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-black tracking-tight mb-1">
            Create Project
          </h2>
          <p className="text-xs text-[#737373] tracking-wide">
            Name your new collaborative workspace canvas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium tracking-wide">
              {error}
            </div>
          )}

          <Input
            label="Project Name"
            placeholder="e.g. Q3 Design Sprints"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            disabled={isPending}
            autoFocus
            error={nameError}
          />

          <Input
            label="Project Description"
            placeholder="Brief description of this workspace"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />

          <div className="flex justify-end gap-3 mt-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isPending}
              className="px-5"
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateProjectModal;
