import { UserSubscription, Project } from "@/types";

export function cn(...classes: (string | undefined | null | boolean | {[key: string]: any})[]) {
  const result: string[] = [];
  
  for (const c of classes) {
    if (!c) continue;
    if (typeof c === "string") {
      result.push(c);
    } else if (typeof c === "object") {
      for (const [key, value] of Object.entries(c)) {
        if (value) {
          result.push(key);
        }
      }
    }
  }
  
  return result.filter(Boolean).join(" ");
}

export function checkIsAccountLocked(
  subscription: UserSubscription | null,
  projects: Project[],
  userId: string | undefined
): boolean {
  if (!userId) return false;
  const activeTier = subscription?.tier || "free";
  const ownedProjects = projects.filter((p) => p.owner_id === userId).length;

  if (activeTier === "free") {
    return ownedProjects > 2;
  }
  if (activeTier === "silver") {
    return ownedProjects > 5;
  }
  return false;
}

