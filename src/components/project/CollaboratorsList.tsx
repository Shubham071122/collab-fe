"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Users, UserPlus, X, Loader2, Copy, LogOut } from "lucide-react";
import { Collaborator } from "@/types";
import { useRouter } from "next/navigation";
import { LeaveConfirmationModal } from "../dashboard/LeaveConfirmationModal";
import {
  getCollaboratorsAction,
  getProjectMembersAction,
  inviteCollaboratorAction,
  updateCollaboratorPermissionAction,
  removeCollaboratorAction,
} from "../../../actions/collaboration.actions";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { toast } from "sonner";
import { BillingModal } from "../dashboard/BillingModal";
import { useAppStore } from "@/lib/store";

interface CollaboratorsListProps {
  projectId: string;
  isOwner: boolean;
  isLocked?: boolean;
  onCollaboratorAdded?: () => void;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-emerald-100 text-emerald-800",
  "bg-violet-100 text-violet-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-cyan-100 text-cyan-800",
];

const getAvatarColor = (name: string) => {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

export const CollaboratorsList = ({
  projectId,
  isOwner,
  isLocked = false,
  onCollaboratorAdded,
}: CollaboratorsListProps) => {
  const { user, isDarkMode, clearProjectMembers } = useAppStore();
  const router = useRouter();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<"read" | "edit">("read");
  const [inviteError, setInviteError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchMembers = async () => {
    try {
      if (isOwner) {
        const res = await getCollaboratorsAction(projectId);
        if (res.success && res.data) setCollaborators(res.data);
      } else {
        const res = await getProjectMembersAction(projectId);
        if (res.success && res.data) {
          const ownerEntry: Collaborator = { ...res.data.owner, permission: "owner" };
          setCollaborators([ownerEntry, ...res.data.collaborators]);
        }
      }
    } catch (err) {
      console.error("Failed to load members", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId, isOwner]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");

    if (!email || !email.includes("@")) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await inviteCollaboratorAction(projectId, email, invitePermission);
        if (res.success) {
          const projectUrl = `${window.location.origin}/project/${projectId}`;
          try {
            await navigator.clipboard.writeText(projectUrl);
            toast.success("Invitation sent & link copied to clipboard!");
          } catch {
            toast.success("Invitation sent successfully!");
          }
          fetchMembers();
          setEmail("");
          setInvitePermission("read");
          setIsPopoverOpen(false);
          if (onCollaboratorAdded) onCollaboratorAdded();
        } else {
          const isLimitErr = res.message === "LIMIT_EXCEEDED" || res.message?.toLowerCase().includes("limit reached") || res.message?.toLowerCase().includes("upgrade");
          const friendlyMessage = isLimitErr
            ? "Collaborator limit reached. Please upgrade your plan."
            : (res.message || "Failed to invite collaborator.");

          setInviteError(friendlyMessage);
          
          if (isLimitErr) {
            toast.error(friendlyMessage, {
              action: {
                label: "Upgrade",
                onClick: () => setIsBillingOpen(true),
              },
            });
          } else {
            toast.error(friendlyMessage);
          }
        }
      } catch {
        setInviteError("An error occurred during invitation.");
        toast.error("An error occurred.");
      }
    });
  };

  const handleCopyLink = async () => {
    const projectUrl = `${window.location.origin}/project/${projectId}`;
    try {
      await navigator.clipboard.writeText(projectUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleLeaveCanvas = () => {
    setIsLeaveOpen(true);
  };

  const confirmLeaveCanvas = async () => {
    if (!user) return;
    setIsLeaving(true);
    try {
      const res = await removeCollaboratorAction(projectId, user.id);
      if (res.success) {
        toast.success("You have left the project successfully");
        router.push("/dashboard");
      } else {
        toast.error(res.message || "Failed to leave project");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLeaving(false);
      setIsLeaveOpen(false);
    }
  };

  const handlePermissionChange = async (
    userId: string,
    newPermission: "read" | "edit" | "remove"
  ) => {
    if (newPermission === "remove") {
      try {
        const res = await removeCollaboratorAction(projectId, userId);
        if (res.success) {
          toast.success("Collaborator access revoked.");
          fetchMembers();
          clearProjectMembers(projectId);
          if (onCollaboratorAdded) onCollaboratorAdded();
        } else {
          toast.error(res.message || "Failed to revoke access.");
        }
      } catch {
        toast.error("An error occurred.");
      }
    } else {
      try {
        const res = await updateCollaboratorPermissionAction(projectId, userId, newPermission);
        if (res.success) {
          toast.success(`Permission updated to ${newPermission}.`);
          fetchMembers();
          clearProjectMembers(projectId);
          if (onCollaboratorAdded) onCollaboratorAdded();
        } else {
          toast.error(res.message || "Failed to update permission.");
        }
      } catch {
        toast.error("An error occurred.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-8 w-20">
        <Loader2 size={14} className="animate-spin text-[#737373]" />
      </div>
    );
  }

  const avatarList = collaborators;

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Avatars Stack */}
      <div className="flex -space-x-2.5">
        {avatarList.slice(0, 4).map((c) => (
          <div
            key={c.id}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-semibold tracking-wide cursor-default relative group shrink-0 hover:z-30 hover:scale-105 hover:border-current transition-all duration-200 ${
              isDarkMode ? "border-[#18181b]" : "border-white"
            } ${getAvatarColor(c.name)}`}
          >
            {getInitials(c.name)}

            {/* Tooltip */}
            <div className={`absolute top-10 left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-wide py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border whitespace-nowrap z-50 flex flex-col gap-0.5 ${
              isDarkMode 
                ? "bg-[#18181b] text-neutral-200 border-neutral-800" 
                : "bg-white text-black border-[#e5e5e7]"
            }`}>
              <span className="font-semibold">{c.name}</span>
              <span className="text-[9px] opacity-60 capitalize">
                {c.permission === "owner" ? "Owner" : c.permission}
              </span>
            </div>
          </div>
        ))}

        {avatarList.length > 4 && (
          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-semibold shrink-0 cursor-default relative group transition-all hover:z-30 hover:scale-105 duration-200 ${
            isDarkMode 
              ? "border-[#18181b] bg-[#27272a] text-neutral-400 hover:border-[#3f3f46]" 
              : "border-white bg-[#f5f5f7] text-[#737373] hover:border-[#e5e5e7]"
          }`}>
            +{avatarList.length - 4}
            
            {/* Overflow Dropdown Card */}
            <div className={`absolute top-10 right-0 w-[220px] p-3.5 rounded-xl border opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-[0_15px_40px_rgba(0,0,0,0.08)] z-50 flex flex-col gap-2.5 ${
              isDarkMode 
                ? "bg-[#18181b] border-neutral-800" 
                : "bg-white border-[#e5e5e7]"
            }`}>
              <span className={`text-[9px] font-bold tracking-widest capitalize ${
                isDarkMode ? "text-neutral-500" : "text-[#737373]"
              }`}>
                Active Collaborators
              </span>
              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                {avatarList.slice(4).map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-xs">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${getAvatarColor(c.name)}`}>
                      {getInitials(c.name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`font-semibold truncate ${isDarkMode ? "text-neutral-200" : "text-black"}`}>{c.name}</span>
                      <span className={`text-[9px] capitalize ${isDarkMode ? "text-neutral-400" : "text-[#737373]"}`}>
                        {c.permission === "owner" ? "Owner" : c.permission}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share / Invite — owner only */}
      {isOwner && !isLocked && (
        <div className="relative">
          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-xl h-8 py-0 px-3 flex items-center gap-1.5 text-xs border ${
              isDarkMode
                ? "bg-[#27272a] text-neutral-200 border-neutral-700/50 hover:bg-[#3f3f46] hover:border-neutral-500 focus:ring-white/10"
                : "bg-white text-black border-[#e5e5e7] hover:border-black/30 hover:bg-[#f5f5f7] active:scale-[0.98] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] focus:ring-black/20"
            }`}
          >
            <UserPlus size={13} className="stroke-[1.5]" />
            <span>Share</span>
          </button>

          {/* Popover Card */}
          {isPopoverOpen && (
            <div className={`absolute right-0 top-10 w-[320px] p-5 rounded-2xl border z-50 animate-scale-in transition-all ${
              isDarkMode
                ? "bg-[#18181b] border-[#27272a] shadow-[0_15px_35px_rgba(0,0,0,0.45)]"
                : "bg-white border-[#e5e5e7] shadow-[0_15px_35px_rgba(0,0,0,0.06)]"
            }`}>
              <div className={`flex items-center justify-between mb-4 border-b pb-2.5 ${
                isDarkMode ? "border-[#27272a]" : "border-[#f5f5f7]"
              }`}>
                <span className={`text-xs font-medium tracking-wide ${
                  isDarkMode ? "text-neutral-200" : "text-black"
                }`}>
                  Invite Collaborators
                </span>
                <button
                  onClick={() => setIsPopoverOpen(false)}
                  className={`cursor-pointer transition-colors ${
                    isDarkMode ? "text-neutral-400 hover:text-white" : "text-[#737373] hover:text-black"
                  }`}
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleInvite} className="flex flex-col gap-4" noValidate>
                <div className="flex gap-2">
                  <div className="flex-grow flex flex-col gap-1">
                    <input
                      type="email"
                      placeholder="collaborator@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (inviteError) setInviteError("");
                      }}
                      disabled={isPending}
                      className={`w-full h-9 px-3 text-xs border rounded-lg transition-all duration-200 outline-none placeholder:text-neutral-500 ${
                        isDarkMode
                          ? "bg-[#27272a] text-neutral-200 border-neutral-700/50 focus:border-neutral-500 focus:ring-1 focus:ring-white/10"
                          : "bg-white text-black border-[#e5e5e7] focus:border-black/40 focus:ring-1 focus:ring-black/10"
                      } ${inviteError ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    {inviteError && (
                      <span className="text-[10px] text-red-500 tracking-wide mt-0.5 px-0.5">
                        {inviteError}
                      </span>
                    )}
                  </div>
                  <select
                    value={invitePermission}
                    onChange={(e) =>
                      setInvitePermission(e.target.value as "read" | "edit")
                    }
                    disabled={isPending}
                    className={`h-9 px-2 text-xs rounded-lg outline-none cursor-pointer font-medium transition-colors shrink-0 border ${
                      isDarkMode
                        ? "bg-[#27272a] text-neutral-300 border-neutral-700/50 hover:text-white focus:border-neutral-500"
                        : "bg-white border-[#e5e5e7] text-[#737373] hover:text-black focus:border-black/40"
                    }`}
                  >
                    <option value="read">Viewer</option>
                    <option value="edit">Editor</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className={`w-full h-9 rounded-xl text-xs font-medium flex items-center justify-center transition-all duration-200 active:scale-[0.98] cursor-pointer border ${
                    isDarkMode
                      ? "bg-neutral-200 text-neutral-900 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-100"
                      : "bg-black text-white border-black hover:bg-black/90 hover:border-black/90"
                  }`}
                >
                  {isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Send Invite"
                  )}
                </button>
              </form>

              <button
                onClick={handleCopyLink}
                type="button"
                className={`w-full mt-3 py-2 border border-dashed rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isDarkMode
                    ? "border-neutral-700/50 hover:border-neutral-500 hover:bg-[#27272a] text-neutral-200"
                    : "border-[#e5e5e7] hover:border-black/30 hover:bg-[#f5f5f7] text-black"
                }`}
              >
                <Copy size={12} className={isDarkMode ? "text-neutral-400" : "text-[#737373]"} />
                Copy share link
              </button>

              {/* Member list inside popover — editable for owner */}
              <div className={`mt-4 pt-3 border-t flex flex-col gap-2 max-h-[140px] overflow-y-auto custom-scrollbar ${
                isDarkMode ? "border-[#27272a]" : "border-[#f5f5f7]"
              }`}>
                <span className={`text-[9px] font-bold tracking-widest uppercase ${
                  isDarkMode ? "text-neutral-500" : "text-[#737373]"
                }`}>
                  Members
                </span>
                {collaborators.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex flex-col min-w-0">
                      <span className={`font-medium truncate ${isDarkMode ? "text-neutral-200" : "text-black"}`}>{c.name}</span>
                      <span className={`text-[10px] truncate ${isDarkMode ? "text-neutral-400" : "text-[#737373]"}`}>{c.email}</span>
                    </div>
                    <select
                      value={c.permission}
                      onChange={(e) =>
                        handlePermissionChange(
                          c.id,
                          e.target.value as "read" | "edit" | "remove"
                        )
                      }
                      className={`text-[10px] font-medium py-0.5 px-1.5 rounded border outline-none cursor-pointer shrink-0 transition-colors ${
                        isDarkMode
                          ? "bg-[#27272a] hover:bg-[#3f3f46] text-neutral-300 hover:text-white border-neutral-700/50"
                          : "bg-[#f5f5f7] hover:bg-[#e5e5e7] text-[#737373] hover:text-black border-black/5"
                      }`}
                    >
                      <option value="read">Viewer</option>
                      <option value="edit">Editor</option>
                      <option value="remove">Remove Access</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Leave button - collaborator only */}
      {!isOwner && user && (
        <button
          onClick={handleLeaveCanvas}
          className={`inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-xl h-8 py-0 px-3 flex items-center gap-1.5 text-xs border ${
            isDarkMode
              ? "bg-[#27272a] text-[#f87171] border-neutral-700/50 hover:bg-[#7f1d1d]/20 hover:border-[#b91c1c]/30 hover:text-[#fca5a5] focus:ring-red-900/20"
              : "bg-white text-[#e02424] border-[#e5e5e7] hover:border-[#fca5a5] hover:bg-red-50/50 active:scale-[0.98] focus:ring-red-100"
          }`}
        >
          <LogOut size={13} className="stroke-[1.5]" />
          <span>Leave</span>
        </button>
      )}

      <BillingModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} />
      
      <LeaveConfirmationModal
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        onConfirm={confirmLeaveCanvas}
        projectName="this project"
        isPending={isLeaving}
      />
    </div>
  );
};
export default CollaboratorsList;
