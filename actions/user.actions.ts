"use server";

import { cookies } from "next/headers";
import { User, ActionResponse } from "@/types";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080";
const COOKIE_NAME = "auth_token";

export async function getUserByIdAction(id: string): Promise<ActionResponse<User>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    const res = await fetch(`${BACKEND_URL}/api/v1/user/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, data: json.data };
    }
    return { success: false, message: json.message || "Failed to retrieve user." };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}
