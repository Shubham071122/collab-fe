"use server";

import { cookies } from "next/headers";
import { Project, ActionResponse } from "@/types";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080";
const COOKIE_NAME = "auth_token";
const PROJECTS_COOKIE_PREFIX = "collab_project_ids_";

async function getUserIdFromToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const decodedJson = Buffer.from(payloadBase64, "base64").toString();
    const payload = JSON.parse(decodedJson);
    return payload.user_id || null;
  } catch {
    return null;
  }
}

async function getUserProjectIds(userId: string): Promise<string[]> {
  const cookieStore = await cookies();
  const idsJson = cookieStore.get(`${PROJECTS_COOKIE_PREFIX}${userId}`)?.value;
  if (!idsJson) return [];
  try {
    return JSON.parse(idsJson);
  } catch {
    return [];
  }
}

async function saveUserProjectIds(userId: string, ids: string[]) {
  const cookieStore = await cookies();
  cookieStore.set(`${PROJECTS_COOKIE_PREFIX}${userId}`, JSON.stringify(ids), {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
  });
}

export async function createProjectAction(
  name: string,
  description: string = ""
): Promise<ActionResponse<Project>> {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, message: "Unauthorized." };

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/project/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, message: json.error || json.message || "Failed to create project." };
    }

    const newProject = json.data as Project;

    const ids = await getUserProjectIds(userId);
    if (!ids.includes(newProject.id)) {
      ids.unshift(newProject.id);
      await saveUserProjectIds(userId, ids);
    }

    return { success: true, message: "Project created successfully.", data: newProject };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}

export async function getProjectByIdAction(
  id: string
): Promise<ActionResponse<Project>> {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, message: "Unauthorized." };

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/project/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, message: json.error || json.message || "Project not found." };
    }

    const project = json.data as Project;
    return { success: true, data: project };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}

export async function addProjectToCookieAction(
  id: string
): Promise<ActionResponse<null>> {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, message: "Unauthorized." };

  try {
    const ids = await getUserProjectIds(userId);
    if (!ids.includes(id)) {
      ids.unshift(id);
      await saveUserProjectIds(userId, ids);
    }
    return { success: true };
  } catch {
    return { success: false, message: "Failed to update project list." };
  }
}

export async function getProjectsAction(
  query?: string
): Promise<ActionResponse<Project[]>> {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, message: "Unauthorized.", data: [] };

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    const ids = await getUserProjectIds(userId);
    if (ids.length === 0) {
      return { success: true, data: [] };
    }

    const projectPromises = ids.map(async (id) => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/project/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        return res.ok && json.success ? (json.data as Project) : null;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(projectPromises);
    const validProjects = results.filter((p): p is Project => p !== null);

    const validIds = validProjects.map((p) => p.id);
    if (validIds.length !== ids.length) {
      await saveUserProjectIds(userId, validIds);
    }

    let filtered = validProjects;
    if (query && query.trim() !== "") {
      const searchStr = query.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchStr));
    }

    return { success: true, data: filtered };
  } catch (err) {
    return { success: false, message: "Network error.", data: [] };
  }
}

export async function updateProjectAction(
  id: string,
  data: { name?: string; description?: string; canvas?: string }
): Promise<ActionResponse<Project>> {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, message: "Unauthorized." };

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/project/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, message: json.error || json.message || "Failed to update project." };
    }

    return { success: true, message: "Project updated successfully.", data: json.data };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}

export async function deleteProjectAction(
  id: string
): Promise<ActionResponse<null>> {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, message: "Unauthorized." };

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/project/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, message: json.error || json.message || "Failed to delete project." };
    }

    const ids = await getUserProjectIds(userId);
    const updatedIds = ids.filter((pId) => pId !== id);
    await saveUserProjectIds(userId, updatedIds);

    return { success: true, message: "Project deleted successfully." };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}
