import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/services';
import { useAuth } from '../components/AuthContext';
import type { Project } from '@shared/types';

const STATUS_COLOR: Record<string, string> = {
  active: '#22c55e',
  completed: '#3b82f6',
  archived: '#6b7280',
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    projectsApi.getAll()
      .then(r => setProjects(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await projectsApi.create({ title: newTitle, description: newDesc });
    setProjects(p => [res.data.data as unknown as Project, ...p]);
    setNewTitle(''); setNewDesc(''); setShowForm(false);
  };

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-logo">⬡ TaskFlow</div>
        <div className="sidebar-user">
          <div className="avatar">{user?.name[0]}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <ul className="sidebar-nav">
          <li className="active"><Link to="/">Projects</Link></li>
        </ul>
        <button className="btn-logout" onClick={logout}>Sign out</button>
      </nav>

      <main className="main-content">
        <div className="page-header">
          <h2>Projects</h2>
          <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
            + New Project
          </button>
        </div>

        {showForm && (
          <form className="inline-form" onSubmit={handleCreate}>
            <input placeholder="Project title" value={newTitle}
              onChange={e => setNewTitle(e.target.value)} required />
            <input placeholder="Description (optional)" value={newDesc}
              onChange={e => setNewDesc(e.target.value)} />
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        )}

        {loading ? <div className="loading">Loading…</div> : (
          <div className="project-grid">
            {projects.map(p => (
              <Link to={`/projects/${p.id}`} key={p.id} className="project-card">
                <div className="project-card-header">
                  <span className="status-dot" style={{ background: STATUS_COLOR[p.status] }} />
                  <span className="project-status">{p.status}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.description || 'No description'}</p>
                <div className="project-meta">
                  <span>👤 {p.owner_name}</span>
                  <span>📋 {p.task_count ?? 0} tasks</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
