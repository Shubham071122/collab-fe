"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Grid, List, SearchX } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectModal } from "./CreateProjectModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { getProjectsAction, deleteProjectAction } from "../../../actions/project.actions";
import { getCurrentUserAction } from "../../../actions/auth.actions";
import { toast } from "sonner";

export const DashboardContent = () => {
  const router = useRouter();
  const { user, projects, setProjects, addProject, removeProject } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("Hello");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);

    const currentUser = useAppStore.getState().user;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    const syncSession = async () => {
      const activeUser = await getCurrentUserAction();
      if (!activeUser) {
        useAppStore.getState().clearSession();
        router.push("/login");
      } else {
        useAppStore.getState().setUser(activeUser);
      }
    };

    syncSession();
  }, []);


  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good morning");
    else if (hours < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const fetchProjects = (query?: string) => {
    startTransition(async () => {
      try {
        const res = await getProjectsAction(query);
        if (res.success && res.data) {
          setProjects(res.data);
        }
      } catch (err) {
        toast.error("Failed to load projects.");
      }
    });
  };

  useEffect(() => {
    if (mounted && user) {
      const delayDebounceFn = setTimeout(() => {
        fetchProjects(searchQuery);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, mounted, user]);

  const handleDeleteTrigger = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      setProjectToDelete({ id, name: proj.name });
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeletingId(projectToDelete.id);
    try {
      const res = await deleteProjectAction(projectToDelete.id);
      if (res.success) {
        removeProject(projectToDelete.id);
        toast.success("Project deleted successfully");
        setProjectToDelete(null);
      } else {
        toast.error(res.message || "Failed to delete project");
      }
    } catch (err) {
      toast.error("An error occurred while deleting the project");
    } finally {
      setIsDeletingId(null);
    }
  };

  if (!mounted || !user) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh] bg-white">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-6 w-6 text-black"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-xs text-[#737373] tracking-wide capitalize font-medium">
            Loading Workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full animate-fade-in flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#e5e5e7] pb-8">
        <div>
          <h1 className="text-3xl font-light text-black tracking-tight leading-none mb-2">
            {greeting}, <span className="font-semibold capitalize">{user.name.split(' ')[0].toLowerCase()}</span>
          </h1>
          <p className="text-xs text-[#737373] tracking-wide">
            Welcome back to your workspace. Start a new canvas or manage existing projects.
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 shrink-0 self-start md:self-center"
        >
          <Plus size={16} />
          Create Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
          <input
            type="text"
            placeholder="Search projects by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f5f5f7] text-black border border-[#e5e5e7] rounded-xl outline-none transition-all duration-200 focus:border-black/30 focus:bg-white placeholder:text-black/30"
          />
        </div>

        <div className="text-xs text-[#737373] font-medium tracking-wide capitalize">
          {projects.length} {projects.length === 1 ? "project" : "projects"} total
        </div>
      </div>

      {isPending && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white">
          <svg
            className="animate-spin h-5 w-5 text-black"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-[#e5e5e7] rounded-3xl py-20 px-6 flex flex-col items-center justify-center text-center bg-white">
          <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] border border-black/5 flex items-center justify-center text-[#737373] mb-5">
            <SearchX size={20} className="stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-medium text-black tracking-tight mb-2">
            {searchQuery ? "No projects found" : "No projects yet"}
          </h3>
          <p className="text-xs sm:text-sm text-[#737373] font-light max-w-sm leading-relaxed mb-6">
            {searchQuery
              ? `We couldn't find any projects matching "${searchQuery}". Try editing your search query.`
              : "Every great workflow starts on a clean slate. Create your first project board to start collaborating with your team."}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={14} />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
          {projects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              currentUserId={user.id}
              onDelete={handleDeleteTrigger}
              isDeleting={isDeletingId === proj.id}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newProj) => {
          addProject(newProj);
          router.push(`/project/${newProj.id}`);
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDelete}
        projectName={projectToDelete?.name}
        isPending={isDeletingId !== null}
      />
    </div>
  );
};
export default DashboardContent;
