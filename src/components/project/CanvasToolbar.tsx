"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CloudCheck } from "lucide-react";
import { Project } from "@/types";
import { CollaboratorsList } from "./CollaboratorsList";
import { updateProjectAction } from "../../../actions/project.actions";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { checkIsAccountLocked } from "@/lib/utils";

interface CanvasToolbarProps {
  project: Project;
  onRenameSuccess?: (newName: string) => void;
}

export const CanvasToolbar = ({ project, onRenameSuccess }: CanvasToolbarProps) => {
  const { user, syncStatus, isDarkMode } = useAppStore();
  const isOwner = !!user && project.owner_id === user.id;
  const isProjectLocked = project.is_locked;

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
    <div className={`w-full h-14 border-b px-4 flex items-center justify-between z-[500] relative select-none transition-colors duration-200 ${
      isDarkMode 
        ? "bg-[#18181b] border-[#27272a] text-neutral-200" 
        : "bg-white border-[#e5e5e7] text-neutral-800"
    }`}>
      {/* Left Area - Back button & Project Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        <Link
          href="/dashboard"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
            isDarkMode 
              ? "text-neutral-400 hover:text-white hover:bg-[#27272a]" 
              : "text-[#737373] hover:text-black hover:bg-[#f5f5f7]"
          }`}
          title="Back to Dashboard"
        >
          <ArrowLeft size={16} />
        </Link>

        {/* Separator */}
        <div className={`w-[1px] h-5 shrink-0 transition-colors duration-200 ${isDarkMode ? "bg-[#27272a]" : "bg-[#e5e5e7]"}`} />

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
              className={`text-sm font-medium px-2.5 py-1 border rounded-md outline-none max-w-[200px] sm:max-w-[300px] transition-colors ${
                isDarkMode 
                  ? "text-neutral-200 bg-[#27272a] border-neutral-700/50 focus:border-neutral-500" 
                  : "text-black bg-[#f5f5f7] border-black/15 focus:border-black/30"
              }`}
            />
          ) : (
            <h1
              onClick={() => {
                if (!isProjectLocked) {
                  setIsEditing(true);
                }
              }}
              className={`text-sm font-medium truncate px-2 py-1 rounded-md transition-colors max-w-[200px] sm:max-w-[300px] ${
                isProjectLocked 
                  ? "cursor-default" 
                  : `cursor-pointer ${isDarkMode ? "hover:bg-[#27272a]" : "hover:bg-[#f5f5f7]"}`
              } ${isDarkMode ? "text-neutral-200" : "text-black"}`}
              title={isProjectLocked ? undefined : "Click to rename"}
            >
              {title}
            </h1>
          )}

          {/* Cloud Sync State */}
          {syncStatus === "saving" ? (
            <div className={`hidden sm:flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 tracking-wide select-none animate-pulse border transition-colors ${
              isDarkMode
                ? "text-amber-400 bg-amber-950/30 border-amber-900/50"
                : "text-amber-600 bg-amber-50 border-amber-100"
            }`}>
              <svg className={`animate-spin h-2.5 w-2.5 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Saving...</span>
            </div>
          ) : (
            <div className={`hidden sm:flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 tracking-wide select-none border transition-colors ${
              isDarkMode
                ? "text-emerald-400 bg-emerald-950/30 border-emerald-900/50"
                : "text-[#459e59] bg-emerald-50 border-emerald-100"
            }`}>
              <CloudCheck size={11} className={isDarkMode ? "text-emerald-400" : "text-[#459e59]"} />
              <span>Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Area - Collaborators Stack */}
      <div className="shrink-0 flex items-center">
        <CollaboratorsList projectId={project.id} isOwner={isOwner} isLocked={isProjectLocked} />
      </div>
    </div>
  );
};
export default CanvasToolbar;
