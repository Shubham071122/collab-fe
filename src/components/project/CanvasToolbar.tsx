"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CloudCheck } from "lucide-react";
import { Project } from "@/types";
import { CollaboratorsList } from "./CollaboratorsList";
import { updateProjectAction } from "../../../actions/project.actions";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

interface CanvasToolbarProps {
  project: Project;
  onRenameSuccess?: (newName: string) => void;
}

export const CanvasToolbar = ({ project, onRenameSuccess }: CanvasToolbarProps) => {
  const { user, syncStatus } = useAppStore();
  const isOwner = !!user && project.owner_id === user.id;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.name);

  useEffect(() => {
    setTitle(project.name);
  }, [project]);

  const handleRenameSubmit = async () => {
    setIsEditing(false);
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle === project.name) {
      setTitle(project.name);
      return;
    }

    try {
      const res = await updateProjectAction(project.id, { name: trimmedTitle });
      if (res.success && res.data) {
        if (onRenameSuccess) {
          onRenameSuccess(trimmedTitle);
        }
        toast.success("Project renamed successfully");
      } else {
        setTitle(project.name);
        toast.error(res.message || "Failed to rename project.");
      }
    } catch {
      setTitle(project.name);
      toast.error("Failed to rename project.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      setTitle(project.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full h-14 bg-white border-b border-[#e5e5e7] px-4 flex items-center justify-between z-[500] relative select-none">
      {/* Left Area - Back button & Project Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        <Link
          href="/dashboard"
          className="text-[#737373] hover:text-black p-1.5 hover:bg-[#f5f5f7] rounded-lg transition-colors cursor-pointer shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft size={16} />
        </Link>

        {/* Separator */}
        <div className="w-[1px] h-5 bg-[#e5e5e7] shrink-0" />

        {/* Editable Title */}
        <div className="flex items-center gap-3 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-sm font-semibold text-black bg-[#f5f5f7] px-2.5 py-1 border border-black/15 rounded-md outline-none max-w-[200px] sm:max-w-[300px]"
            />
          ) : (
            <h1
              onClick={() => setIsEditing(true)}
              className="text-sm font-semibold text-black truncate cursor-pointer hover:bg-[#f5f5f7] px-2 py-1 rounded-md transition-colors max-w-[200px] sm:max-w-[300px]"
              title="Click to rename"
            >
              {title}
            </h1>
          )}

          {/* Cloud Sync State */}
          {syncStatus === "saving" ? (
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-medium shrink-0 tracking-wide select-none animate-pulse">
              <svg className="animate-spin h-2.5 w-2.5 text-amber-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Saving...</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#459e59] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-medium shrink-0 tracking-wide select-none">
              <CloudCheck size={11} className="text-[#459e59]" />
              <span>Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Area - Collaborators Stack */}
      <div className="shrink-0 flex items-center">
        <CollaboratorsList projectId={project.id} isOwner={isOwner} />
      </div>
    </div>
  );
};
export default CanvasToolbar;
