"use client";

import Link from "next/link";
import { FolderOpen, Users, Trash2 } from "lucide-react";
import { Project } from "@/types";
import { Button } from "@/components/common/Button";

import { useState, useEffect } from "react";
import { getCollaboratorsAction } from "../../../actions/collaboration.actions";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const ProjectCard = ({ project, onDelete, isDeleting }: ProjectCardProps) => {
  const [collabCount, setCollabCount] = useState(1);

  useEffect(() => {
    const fetchCollabs = async () => {
      const res = await getCollaboratorsAction(project.id);
      if (res.success && res.data) {
        setCollabCount(res.data.length + 1);
      }
    };
    fetchCollabs();
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

  return (
    <div className="bg-white border border-[#e5e5e7] p-6 rounded-2xl flex flex-col justify-between h-[180px] hover-apple group relative">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold text-black tracking-tight line-clamp-1">
            {project.name}
          </h3>
          <button
            onClick={() => onDelete(project.id)}
            disabled={isDeleting}
            className="text-[#737373] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded hover:bg-red-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            title="Delete Project"
          >
            <Trash2 size={14} className="stroke-[1.5]" />
          </button>
        </div>
        <span className="text-[10px] text-[#737373] tracking-wide uppercase mt-1 block">
          Updated {getRelativeTime(project.updated_at)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-[#f5f5f7] pt-4 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-[#737373] font-medium tracking-wide">
          <Users size={14} className="stroke-[1.5] text-black/40" />
          <span>{collabCount} {collabCount === 1 ? 'collaborator' : 'collaborators'}</span>
        </div>
        
        <Link href={`/project/${project.id}`}>
          <Button variant="outline" size="sm" className="h-8 py-0 px-3 text-xs">
            Open Project
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default ProjectCard;
