import { Response } from 'express';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getTasksByProject = (req: AuthRequest, res: Response): void => {
  const { projectId } = req.params;
  const { status, priority } = req.query;

  let query = `
    SELECT t.*, u.name as assignee_name, c.name as creator_name,
           COUNT(cm.id) as comment_count
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN users c ON t.created_by = c.id
    LEFT JOIN comments cm ON cm.task_id = t.id
    WHERE t.project_id = ?
  `;
  const params: (string | number)[] = [projectId];

  if (status) { query += ' AND t.status = ?'; params.push(status as string); }
  if (priority) { query += ' AND t.priority = ?'; params.push(priority as string); }

  query += ' GROUP BY t.id ORDER BY t.created_at DESC';
  const tasks = db.prepare(query).all(...params);
  res.json({ success: true, data: tasks });
};

export const getTaskById = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;

  const task = db.prepare(`
    SELECT t.*, p.title as project_title, u.name as assignee_name, c.name as creator_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN users c ON t.created_by = c.id
    WHERE t.id = ?
  `).get(id);

  if (!task) throw new AppError(404, 'Task not found');

  const comments = db.prepare(`
    SELECT cm.*, u.name as author_name
    FROM comments cm
    LEFT JOIN users u ON cm.author_id = u.id
    WHERE cm.task_id = ?
    ORDER BY cm.created_at ASC
  `).all(id);

  res.json({ success: true, data: { ...task as object, comments } });
};

export const createTask = (req: AuthRequest, res: Response): void => {
  const { projectId } = req.params;
  const { title, description, status, priority, due_date, assignee_id } = req.body;

  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
  if (!project) throw new AppError(404, 'Project not found');

  const result = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, due_date, project_id, assignee_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    description || null,
    status || 'todo',
    priority || 'medium',
    due_date || null,
    projectId,
    assignee_id || null,
    req.user!.id
  );

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: task, message: 'Task created' });
};

export const updateTask = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;
  if (!task) throw new AppError(404, 'Task not found');

  const { title, description, status, priority, due_date, assignee_id } = req.body;

  db.prepare(`
    UPDATE tasks SET
      title = ?, description = ?, status = ?, priority = ?,
      due_date = ?, assignee_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title ?? task.title,
    description ?? task.description,
    status ?? task.status,
    priority ?? task.priority,
    due_date ?? task.due_date,
    assignee_id !== undefined ? assignee_id : task.assignee_id,
    id
  );

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json({ success: true, data: updated, message: 'Task updated' });
};

export const deleteTask = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) throw new AppError(404, 'Task not found');

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.json({ success: true, message: 'Task deleted' });
};

export const addComment = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const { content } = req.body;

  const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id);
  if (!task) throw new AppError(404, 'Task not found');

  const result = db.prepare(
    'INSERT INTO comments (content, task_id, author_id) VALUES (?, ?, ?)'
  ).run(content, id, req.user!.id);

  const comment = db.prepare(`
    SELECT cm.*, u.name as author_name FROM comments cm
    LEFT JOIN users u ON cm.author_id = u.id
    WHERE cm.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({ success: true, data: comment, message: 'Comment added' });
};
