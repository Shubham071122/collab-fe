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
