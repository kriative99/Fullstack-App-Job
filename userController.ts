import { Response } from 'express';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';

export const getAllUsers = (_req: AuthRequest, res: Response): void => {
  const users = db.prepare(
    'SELECT id, name, email, role, created_at FROM users ORDER BY name ASC'
  ).all();
  res.json({ success: true, data: users });
};

export const getStats = (_req: AuthRequest, res: Response): void => {
  const stats = {
    users: (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count,
    projects: (db.prepare('SELECT COUNT(*) as count FROM projects').get() as any).count,
    tasks: (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as any).count,
    tasks_by_status: db.prepare(
      "SELECT status, COUNT(*) as count FROM tasks GROUP BY status"
    ).all(),
    tasks_by_priority: db.prepare(
      "SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority"
    ).all(),
  };
  res.json({ success: true, data: stats });
};
