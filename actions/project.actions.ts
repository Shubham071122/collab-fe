"use server";

import { cookies } from "next/headers";
import { Project, ActionResponse } from "@/types";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080";
const COOKIE_NAME = "auth_token";

async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

async function getUserIdFromToken(): Promise<string | null> {
  try {
    const token = await getAuthToken();
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

export async function createProjectAction(
  name: string,
  description: string = ""
): Promise<ActionResponse<Project>> {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, message: "Unauthorized." };

  const token = await getAuthToken();

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
      return {
        success: false,
        message: json.error || json.message || "Failed to create project.",
      };
    }

    return {
      success: true,
      message: "Project created successfully.",
      data: json.data as Project,
    };
  } catch {
    return { success: false, message: "Network error." };
  }
}

export async function getProjectByIdAction(
  id: string
): Promise<ActionResponse<Project>> {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, message: "Unauthorized." };

  const token = await getAuthToken();

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/project/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.error || json.message || "Project not found.",
      };
    }

    return { success: true, data: json.data as Project };
  } catch {
    return { success: false, message: "Network error." };
  }
}

// ✅ DB-first: calls GET /api/v1/project/ which returns all owned + shared projects
export async function getProjectsAction(
  query?: string
): Promise<ActionResponse<Project[]>> {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, message: "Unauthorized.", data: [] };

  const token = await getAuthToken();

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/project/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.error || json.message || "Failed to fetch projects.",
        data: [],
      };
    }

    let projects = (json.data as Project[]) || [];

    if (query && query.trim() !== "") {
      const searchStr = query.toLowerCase();
      projects = projects.filter((p) =>
        p.name.toLowerCase().includes(searchStr)
      );
    }

    return { success: true, data: projects };
  } catch {
    return { success: false, message: "Network error.", data: [] };
  }
}

export async function updateProjectAction(
  id: string,
  data: { name?: string; description?: string; canvas?: string }
): Promise<ActionResponse<Project>> {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, message: "Unauthorized." };

  const token = await getAuthToken();

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
      return {
        success: false,
        message: json.error || json.message || "Failed to update project.",
      };
    }

    return {
      success: true,
      message: "Project updated successfully.",
      data: json.data as Project,
    };
  } catch {
    return { success: false, message: "Network error." };
  }
}

export async function deleteProjectAction(
  id: string
): Promise<ActionResponse<null>> {
  const userId = await getUserIdFromToken();
  if (!userId) return { success: false, message: "Unauthorized." };

  const token = await getAuthToken();

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
      return {
        success: false,
        message: json.error || json.message || "Failed to delete project.",
      };
    }

    return { success: true, message: "Project deleted successfully." };
  } catch {
    return { success: false, message: "Network error." };
  }
}

// kept for backwards compat if anything else uses it
export async function addProjectToCookieAction(
  _id: string
): Promise<ActionResponse<null>> {
  return { success: true };
}
