import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Project, UserSubscription, PlanConfig } from "@/types";

interface AppState {
  user: User | null;
  projects: Project[];
  isLoading: boolean;
  syncStatus: "saved" | "saving";
  subscription: UserSubscription | null;
  plans: PlanConfig[];
  isDarkMode: boolean;
  
  setUser: (user: User | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  clearSession: () => void;
  setSyncStatus: (status: "saved" | "saving") => void;
  setSubscription: (sub: UserSubscription | null) => void;
  setPlans: (plans: PlanConfig[]) => void;
  setIsDarkMode: (isDark: boolean) => void;
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

      setUser: (user) => set({ user }),
      setProjects: (projects) => set({ projects }),
      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),
      removeProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        })),
      clearSession: () => set({ user: null, projects: [], subscription: null }),
      setSyncStatus: (status) => set({ syncStatus: status }),
      setSubscription: (subscription) => set({ subscription }),
      setPlans: (plans) => set({ plans }),
      setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
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

