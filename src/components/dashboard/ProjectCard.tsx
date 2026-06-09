"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Project, Collaborator } from "@/types";
import { Button } from "@/components/common/Button";
import { useState, useEffect } from "react";
import { getProjectMembersAction } from "../../../actions/collaboration.actions";

interface ProjectCardProps {
  project: Project;
  currentUserId: string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-violet-100 text-violet-800 border-violet-200",
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-rose-100 text-rose-800 border-rose-200",
  "bg-cyan-100 text-cyan-800 border-cyan-200",
];

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const ProjectCard = ({
  project,
  currentUserId,
  onDelete,
  isDeleting,
}: ProjectCardProps) => {
  const isOwner = project.owner_id === currentUserId;
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [owner, setOwner] = useState<Collaborator | null>(null);
  const [totalCount, setTotalCount] = useState(1);

  useEffect(() => {
    const fetchMembers = async () => {
      const res = await getProjectMembersAction(project.id);
      if (res.success && res.data) {
        setCollaborators(res.data.collaborators || []);
        setOwner(res.data.owner || null);
        setTotalCount(res.data.total_count);
      }
    };
    fetchMembers();
  }, [project.id]);

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "recently";
    }
  };

  const ownerAvatar = owner ?? { id: project.owner_id, name: "Owner", email: "", permission: "owner" as const };
  const avatarsToShow = [ownerAvatar, ...collaborators].slice(0, 4);
  const overflow = totalCount > 4 ? totalCount - 4 : 0;

  return (
    <div className="bg-white border border-[#e5e5e7] p-6 rounded-2xl flex flex-col justify-between h-[190px] hover-apple group relative">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold text-black tracking-tight line-clamp-1">
            {project.name}
          </h3>
          {/* Only owner sees delete button */}
          {isOwner && (
            <button
              onClick={() => onDelete(project.id)}
              disabled={isDeleting}
              className="text-[#737373] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded hover:bg-red-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              title="Delete Project"
            >
              <Trash2 size={14} className="stroke-[1.5]" />
            </button>
          )}
        </div>
        <span className="text-[10px] text-[#737373] tracking-wide capitalize mt-1 block">
          Updated {getRelativeTime(project.updated_at)}
        </span>
        {project.description && (
          <p className="text-xs text-[#737373] mt-2 line-clamp-2 leading-relaxed capitalize">
            {project.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#f5f5f7] pt-3 mt-auto">
        {/* Avatar stack */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {avatarsToShow.map((av, idx) => (
              <div
                key={av.id + idx}
                title={av.name + (av.id === project.owner_id ? " (Owner)" : "")}
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-white text-[10px] font-semibold cursor-default shrink-0 ${getAvatarColor(av.name)}`}
              >
                {getInitials(av.name)}
              </div>
            ))}
            {overflow > 0 && (
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-white bg-[#f5f5f7] text-[#737373] text-[10px] font-semibold shrink-0">
                +{overflow}
              </div>
            )}
          </div>
          <span className="text-[10px] text-[#737373] font-medium tracking-wide">
            {totalCount} {totalCount === 1 ? "member" : "members"}
          </span>
        </div>

        <Link href={`/project/${project.id}`}>
          <Button variant="outline" size="sm" className="h-8 py-0 px-3 text-xs">
            Open
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default ProjectCard;
