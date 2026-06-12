import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Project } from "@/types";

interface AppState {
  user: User | null;
  projects: Project[];
  isLoading: boolean;
  syncStatus: "saved" | "saving";
  
  setUser: (user: User | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  clearSession: () => void;
  setSyncStatus: (status: "saved" | "saving") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      projects: [],
      isLoading: false,
      syncStatus: "saved",

      setUser: (user) => set({ user }),
      setProjects: (projects) => set({ projects }),
      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),
      removeProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        })),
      clearSession: () => set({ user: null, projects: [] }),
      setSyncStatus: (status) => set({ syncStatus: status }),
    }),
    {
      name: "collab-app-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
