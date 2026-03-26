import { Response } from 'express';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getAllProjects = (req: AuthRequest, res: Response): void => {
  const projects = db.prepare(`
    SELECT p.*, u.name as owner_name,
           COUNT(DISTINCT t.id) as task_count
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    LEFT JOIN tasks t ON t.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all();

  res.json({ success: true, data: projects });
};

export const getProjectById = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;

  const project = db.prepare(`
    SELECT p.*, u.name as owner_name,
           COUNT(DISTINCT t.id) as task_count
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    LEFT JOIN tasks t ON t.project_id = p.id
    WHERE p.id = ?
    GROUP BY p.id
  `).get(id);

  if (!project) throw new AppError(404, 'Project not found');

  const tasks = db.prepare(`
    SELECT t.*, u.name as assignee_name, c.name as creator_name,
           COUNT(cm.id) as comment_count
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN users c ON t.created_by = c.id
    LEFT JOIN comments cm ON cm.task_id = t.id
    WHERE t.project_id = ?
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `).all(id);

  res.json({ success: true, data: { ...project as object, tasks } });
};

export const createProject = (req: AuthRequest, res: Response): void => {
  const { title, description, status } = req.body;
  const owner_id = req.user!.id;

  const result = db.prepare(`
    INSERT INTO projects (title, description, status, owner_id)
    VALUES (?, ?, ?, ?)
  `).run(title, description || null, status || 'active', owner_id);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: project, message: 'Project created' });
};

export const updateProject = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!project) throw new AppError(404, 'Project not found');

  if (req.user!.role !== 'admin' && project.owner_id !== req.user!.id) {
    throw new AppError(403, 'Not authorized to update this project');
  }

  db.prepare(`
    UPDATE projects SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title ?? project.title, description ?? project.description, status ?? project.status, id);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.json({ success: true, data: updated, message: 'Project updated' });
};

export const deleteProject = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;

  if (!project) throw new AppError(404, 'Project not found');
  if (req.user!.role !== 'admin' && project.owner_id !== req.user!.id) {
    throw new AppError(403, 'Not authorized to delete this project');
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  res.json({ success: true, message: 'Project deleted' });
};
