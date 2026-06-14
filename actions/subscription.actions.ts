"use server";

import { cookies } from "next/headers";
import { PlanConfig, UserSubscription, ActionResponse } from "@/types";

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

export async function getPlansAction(): Promise<ActionResponse<PlanConfig[]>> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/plans`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.error || json.message || "Failed to retrieve plans.",
        data: [],
      };
    }

    const plans = (json.data as any[]).map((plan) => ({
      id: plan.id,
      name: plan.name,
      price_in_rs: plan.price_in_rs !== undefined ? plan.price_in_rs : plan.PriceInRs || 0,
      max_projects: plan.max_projects !== undefined ? plan.max_projects : plan.MaxProjects || 0,
      max_shares: plan.max_shares !== undefined ? plan.max_shares : plan.MaxShares || 0,
      description: plan.description || plan.Description || "",
    }));

    return { success: true, data: plans };
  } catch (err) {
    return { success: false, message: "Network error.", data: [] };
  }
}

export async function getSubscriptionAction(): Promise<ActionResponse<UserSubscription>> {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized." };

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/subscription/`, {
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
        message: json.error || json.message || "Failed to retrieve subscription.",
      };
    }

    return { success: true, data: json.data as UserSubscription };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}

export async function updateSubscriptionAction(
  tier: string
): Promise<ActionResponse<UserSubscription>> {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized." };

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/subscription/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tier }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.error || json.message || "Failed to update subscription.",
      };
    }

    return {
      success: true,
      message: "Subscription updated successfully.",
      data: json.data as UserSubscription,
    };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}
