import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsApi, tasksApi, usersApi } from '../api/services';
import type { Project, Task, User } from '@shared/types';

const PRIORITY_COLOR: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
const STATUS_LABEL: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<(Project & { tasks: Task[] }) | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'medium', status: 'todo', assignee_id: '', due_date: '' });

  const load = () => {
    Promise.all([
      projectsApi.getById(Number(id)),
      usersApi.getAll(),
    ]).then(([pr, ur]) => {
      setProject(pr.data.data);
      setUsers(ur.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await tasksApi.create(Number(id), {
      ...form,
      assignee_id: form.assignee_id ? Number(form.assignee_id) : undefined,
    } as Partial<Task>);
    setForm({ title: '', priority: 'medium', status: 'todo', assignee_id: '', due_date: '' });
    setShowForm(false);
    load();
  };

  const handleStatusChange = async (task: Task, status: Task['status']) => {
    await tasksApi.update(Number(id), task.id, { status });
    load();
  };

  if (loading) return <div className="loading-page">Loading…</div>;
  if (!project) return <div className="loading-page">Project not found</div>;

  const grouped = {
    todo: project.tasks.filter(t => t.status === 'todo'),
    in_progress: project.tasks.filter(t => t.status === 'in_progress'),
    done: project.tasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-logo">⬡ TaskFlow</div>
        <Link to="/" className="back-link">← All Projects</Link>
      </nav>

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2>{project.title}</h2>
            <p className="subtitle">{project.description}</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(v => !v)}>+ Add Task</button>
        </div>

        {showForm && (
          <form className="inline-form" onSubmit={handleCreateTask}>
            <input placeholder="Task title" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <select value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input type="date" value={form.due_date}
              onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        )}

        <div className="kanban-board">
          {(['todo', 'in_progress', 'done'] as const).map(col => (
            <div className="kanban-column" key={col}>
              <div className="kanban-header">
                <span>{STATUS_LABEL[col]}</span>
                <span className="task-count">{grouped[col].length}</span>
              </div>
              {grouped[col].map(task => (
                <div className="task-card" key={task.id}>
                  <div className="task-top">
                    <span className="priority-badge" style={{ background: PRIORITY_COLOR[task.priority] }}>
                      {task.priority}
                    </span>
                    {task.due_date && <span className="due-date">📅 {task.due_date}</span>}
                  </div>
                  <h4>{task.title}</h4>
                  {task.assignee_name && <p className="assignee">👤 {task.assignee_name}</p>}
                  <div className="task-actions">
                    {col !== 'todo' && (
                      <button className="btn-micro" onClick={() => handleStatusChange(task, col === 'in_progress' ? 'todo' : 'in_progress')}>
                        ← Back
                      </button>
                    )}
                    {col !== 'done' && (
                      <button className="btn-micro btn-advance" onClick={() => handleStatusChange(task, col === 'todo' ? 'in_progress' : 'done')}>
                        {col === 'todo' ? 'Start →' : 'Done ✓'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {grouped[col].length === 0 && <div className="kanban-empty">No tasks here</div>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
