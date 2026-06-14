export interface User {
  id: string;
  name: string;
  email: string;
  is_verified: boolean;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  canvas: string;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  permission: "read" | "edit" | "owner";
}

export interface MemberInfo {
  total_count: number;
  owner: Collaborator;
  collaborators: Collaborator[];
}

export interface ActionResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export type SubscriptionTier = "free" | "silver" | "gold";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "incomplete";

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  provider: "none" | "stripe" | "razorpay";
  provider_subscription_id?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanConfig {
  id: SubscriptionTier;
  name: string;
  price_in_rs: number;
  max_projects: number;
  max_shares: number;
  description: string;
}

