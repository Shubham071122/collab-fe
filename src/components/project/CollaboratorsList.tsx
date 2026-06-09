"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Users, UserPlus, X, Check, Loader2 } from "lucide-react";
import { Collaborator } from "@/types";
import { getCollaboratorsAction, inviteCollaboratorAction } from "../../../actions/collaboration.actions";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { toast } from "sonner";

interface CollaboratorsListProps {
  projectId: string;
  onCollaboratorAdded?: () => void;
}

export const CollaboratorsList = ({ projectId, onCollaboratorAdded }: CollaboratorsListProps) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchCollaborators = async () => {
    try {
      const res = await getCollaboratorsAction(projectId);
      if (res.success && res.data) {
        setCollaborators(res.data);
      }
    } catch (err) {
      console.error("Failed to load collaborators", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [projectId]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");

    if (!email || !email.includes("@")) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await inviteCollaboratorAction(projectId, email);
        if (res.success) {
          toast.success(res.message || "Invitation sent!");
          fetchCollaborators();
          setEmail("");
          setIsPopoverOpen(false);
          if (onCollaboratorAdded) onCollaboratorAdded();
        } else {
          setInviteError(res.message || "Failed to invite collaborator.");
          toast.error(res.message || "Failed to invite.");
        }
      } catch (err) {
        setInviteError("An error occurred during invitation.");
        toast.error("An error occurred.");
      }
    });
  };

  // Color mapping helper based on first letter of name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
      "bg-violet-100 text-violet-800 border-violet-200",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-rose-100 text-rose-800 border-rose-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-8 w-20">
        <Loader2 size={14} className="animate-spin text-[#737373]" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Avatars Stack */}
      <div className="flex -space-x-2.5 overflow-hidden">
        {collaborators.slice(0, 4).map((c) => (
          <div
            key={c.id}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white text-xs font-semibold tracking-wide cursor-help relative group shrink-0 ${getAvatarColor(
              c.name
            )}`}
          >
            {getInitials(c.name)}
            
            {/* Tooltip */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-medium tracking-wide py-1 px-2.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md whitespace-nowrap z-50">
              {c.name} ({c.permission})
            </div>
          </div>
        ))}

        {collaborators.length > 4 && (
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-[#f5f5f7] text-[#737373] text-xs font-semibold shrink-0 cursor-help relative group">
            +{collaborators.length - 4}
            {/* Tooltip */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-medium tracking-wide py-1.5 px-3 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md whitespace-nowrap z-50 flex flex-col gap-1 max-w-[200px]">
              {collaborators.slice(4).map((c) => (
                <span key={c.id}>{c.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share / Invite Popover Button */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="h-8 py-0 px-3 flex items-center gap-1.5 text-xs"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        >
          <UserPlus size={13} className="stroke-[1.5]" />
          <span>Share</span>
        </Button>

        {/* Popover Card */}
        {isPopoverOpen && (
          <div className="absolute right-0 top-10 w-[300px] bg-white border border-[#e5e5e7] p-5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.06)] z-50 animate-scale-in">
            <div className="flex items-center justify-between mb-4 border-b border-[#f5f5f7] pb-2.5">
              <span className="text-xs font-semibold text-black tracking-wide">Invite Collaborators</span>
              <button
                onClick={() => setIsPopoverOpen(false)}
                className="text-[#737373] hover:text-black cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="flex flex-col gap-4" noValidate>
              <Input
                placeholder="collaborator@example.com"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (inviteError) setInviteError("");
                }}
                disabled={isPending}
                className="h-9 py-1 px-3 text-xs"
                error={inviteError}
              />
              <Button
                variant="primary"
                type="submit"
                size="sm"
                isLoading={isPending}
                className="h-9 py-0 w-full text-xs font-semibold"
              >
                Send Invite
              </Button>
            </form>

            {/* List of current members inside popover */}
            <div className="mt-4 pt-3 border-t border-[#f5f5f7] flex flex-col gap-2 max-h-[140px] overflow-y-auto custom-scrollbar">
              <span className="text-[9px] font-bold text-[#737373] tracking-widest uppercase">Members</span>
              {collaborators.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-black truncate">{c.name}</span>
                    <span className="text-[10px] text-[#737373] truncate">{c.email}</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#737373] uppercase bg-[#f5f5f7] px-2 py-0.5 rounded border border-black/5 shrink-0">
                    {c.permission}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CollaboratorsList;
