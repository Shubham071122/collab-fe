"use server";

import { cookies } from "next/headers";
import { PlanConfig, UserSubscription, ActionResponse, SubscriptionTransaction } from "@/types";

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

export async function createCheckoutAction(
  tier: string
): Promise<ActionResponse<{ subscription_id: string }>> {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized." };

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/subscription/checkout`, {
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
        message: json.error || json.message || "Failed to initiate checkout.",
      };
    }

    return {
      success: true,
      data: json.data as { subscription_id: string },
    };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}

export async function verifySubscriptionAction(
  subscriptionId: string,
  paymentId: string,
  signature: string
): Promise<ActionResponse<void>> {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized." };

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/subscription/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subscription_id: subscriptionId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.error || json.message || "Verification failed.",
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}

export async function cancelSubscriptionCheckoutAction(
  subscriptionId: string
): Promise<ActionResponse<void>> {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized." };

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/subscription/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subscription_id: subscriptionId,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.error || json.message || "Failed to cancel checkout.",
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    return { success: false, message: "Network error." };
  }
}

export async function getTransactionsAction(): Promise<ActionResponse<SubscriptionTransaction[]>> {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized.", data: [] };

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/subscription/transactions`, {
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
        message: json.error || json.message || "Failed to retrieve transaction history.",
        data: [],
      };
    }

    return {
      success: true,
      data: json.data as SubscriptionTransaction[],
    };
  } catch (err) {
    return { success: false, message: "Network error.", data: [] };
  }
}

