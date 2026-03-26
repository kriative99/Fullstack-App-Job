import api from './client';
import type { Project, Task, User, Comment } from '@shared/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/login', data),
  me: () => api.get<{ success: boolean; data: User }>('/auth/me'),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: () => api.get<{ success: boolean; data: Project[] }>('/projects'),
  getById: (id: number) =>
    api.get<{ success: boolean; data: Project & { tasks: Task[] } }>(`/projects/${id}`),
  create: (data: Partial<Project>) => api.post('/projects', data),
  update: (id: number, data: Partial<Project>) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

// ─── Tasks ─────────────────────────────────────────────────────────────────────
export const tasksApi = {
  getByProject: (projectId: number, params?: Record<string, string>) =>
    api.get<{ success: boolean; data: Task[] }>(`/projects/${projectId}/tasks`, { params }),
  getById: (projectId: number, id: number) =>
    api.get<{ success: boolean; data: Task & { comments: Comment[] } }>(
      `/projects/${projectId}/tasks/${id}`
    ),
  create: (projectId: number, data: Partial<Task>) =>
    api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId: number, id: number, data: Partial<Task>) =>
    api.put(`/projects/${projectId}/tasks/${id}`, data),
  delete: (projectId: number, id: number) =>
    api.delete(`/projects/${projectId}/tasks/${id}`),
  addComment: (projectId: number, taskId: number, content: string) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content }),
};

// ─── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => api.get<{ success: boolean; data: User[] }>('/users'),
  getStats: () => api.get('/users/stats'),
};
