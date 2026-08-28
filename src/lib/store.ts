import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Project, UserSubscription, PlanConfig, Collaborator } from "@/types";

export interface ProjectMembersData {
  collaborators: Collaborator[];
  owner: Collaborator | null;
  total_count: number;
}

interface AppState {
  user: User | null;
  projects: Project[];
  isLoading: boolean;
  syncStatus: "saved" | "saving";
  subscription: UserSubscription | null;
  plans: PlanConfig[];
  isDarkMode: boolean;
  projectMembers: Record<string, ProjectMembersData>;
  
  setUser: (user: User | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  clearSession: () => void;
  setSyncStatus: (status: "saved" | "saving") => void;
  setSubscription: (sub: UserSubscription | null) => void;
  setPlans: (plans: PlanConfig[]) => void;
  setIsDarkMode: (isDark: boolean) => void;
  setProjectMembers: (projectId: string, data: ProjectMembersData) => void;
  clearProjectMembers: (projectId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      projects: [],
      isLoading: false,
      syncStatus: "saved",
      subscription: null,
      plans: [],
      isDarkMode: false,
      projectMembers: {},

      setUser: (user) => set({ user }),
      setProjects: (projects) => set({ projects }),
      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),
      removeProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        })),
      clearSession: () => set({ user: null, projects: [], subscription: null, projectMembers: {} }),
      setSyncStatus: (status) => set({ syncStatus: status }),
      setSubscription: (subscription) => set({ subscription }),
      setPlans: (plans) => set({ plans }),
      setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
      setProjectMembers: (projectId, data) =>
        set((state) => ({
          projectMembers: {
            ...state.projectMembers,
            [projectId]: data,
          },
        })),
      clearProjectMembers: (projectId) =>
        set((state) => {
          const { [projectId]: _, ...rest } = state.projectMembers;
          return { projectMembers: rest };
        }),
    }),
    {
      name: "collab-app-storage",
      partialize: (state) => ({
        user: state.user,
        subscription: state.subscription,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);

