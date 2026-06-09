"use server";

import { cookies } from "next/headers";
import { Collaborator, MemberInfo, ActionResponse } from "@/types";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080";
const COOKIE_NAME = "auth_token";

export async function getProjectMembersAction(
  projectId: string
): Promise<ActionResponse<MemberInfo>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/project/${projectId}/members`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, message: json.message || "Failed to load members." };
  } catch {
    return { success: false, message: "Network error." };
  }
}

export async function getCollaboratorsAction(
  projectId: string
): Promise<ActionResponse<Collaborator[]>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/project/${projectId}/collaborators`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data || [] };
    }
    return { success: false, message: json.message || "Failed to load collaborators." };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}

export async function inviteCollaboratorAction(
  projectId: string,
  email: string,
  permission: "read" | "edit" = "edit"
): Promise<ActionResponse<null>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/project/${projectId}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, permission }),
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, message: "Project shared successfully!" };
    }
    return { success: false, message: json.error || json.message || "Failed to invite." };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}

export async function updateCollaboratorPermissionAction(
  projectId: string,
  userId: string,
  permission: "read" | "edit"
): Promise<ActionResponse<null>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/project/${projectId}/collaborators/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ permission }),
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, message: "Permission updated successfully." };
    }
    return { success: false, message: json.error || json.message || "Failed to update permission." };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}

export async function removeCollaboratorAction(
  projectId: string,
  userId: string
): Promise<ActionResponse<null>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/project/${projectId}/collaborators/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, message: "Collaborator removed successfully." };
    }
    return { success: false, message: json.error || json.message || "Failed to remove collaborator." };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}
