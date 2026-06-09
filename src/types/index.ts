export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  canvas: string; // JSON string of canvas state
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  permission: "read" | "edit" | "owner"; // 'owner' is handled for the primary project owner
}

export interface ActionResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
