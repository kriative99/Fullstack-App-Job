// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

export interface UserRow extends User {
  password_hash: string;
}

// ─── Project ─────────────────────────────────────────────────────────────────
export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface Project {
  id: number;
  title: string;
  description: string | null;
  status: ProjectStatus;
  owner_id: number;
  owner_name?: string;
  task_count?: number;
  created_at: string;
  updated_at: string;
}

// ─── Task ─────────────────────────────────────────────────────────────────────
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  project_id: number;
  project_title?: string;
  assignee_id: number | null;
  assignee_name?: string | null;
  created_by: number;
  creator_name?: string;
  comment_count?: number;
  created_at: string;
  updated_at: string;
}

// ─── Comment ─────────────────────────────────────────────────────────────────
export interface Comment {
  id: number;
  content: string;
  task_id: number;
  author_id: number;
  author_name?: string;
  created_at: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthPayload {
  id: number;
  email: string;
  role: 'admin' | 'member';
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
