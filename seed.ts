import bcrypt from 'bcryptjs';
import db from './database';
import { runMigrations } from './migrate';

async function seed(): Promise<void> {
  console.log('Seeding database...');
  runMigrations();

  // Clear existing data
  db.exec(`DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users;`);

  // Seed users
  const passwordHash = await bcrypt.hash('password123', 10);

  const insertUser = db.prepare(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`
  );

  const alice = insertUser.run('Alice Johnson', 'alice@example.com', passwordHash, 'admin');
  const bob = insertUser.run('Bob Smith', 'bob@example.com', passwordHash, 'member');
  const carol = insertUser.run('Carol White', 'carol@example.com', passwordHash, 'member');

  // Seed projects
  const insertProject = db.prepare(
    `INSERT INTO projects (title, description, status, owner_id) VALUES (?, ?, ?, ?)`
  );

  const p1 = insertProject.run('Website Redesign', 'Revamp the company website with modern UI', 'active', alice.lastInsertRowid);
  const p2 = insertProject.run('Mobile App MVP', 'Build the first version of our mobile app', 'active', bob.lastInsertRowid);
  const p3 = insertProject.run('API Integration', 'Integrate third-party payment APIs', 'completed', alice.lastInsertRowid);

  // Seed tasks
  const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, due_date, project_id, assignee_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const t1 = insertTask.run('Design homepage mockup', 'Create Figma mockups for the new homepage', 'done', 'high', '2025-01-15', p1.lastInsertRowid, bob.lastInsertRowid, alice.lastInsertRowid);
  const t2 = insertTask.run('Implement responsive nav', 'Build responsive navigation component', 'in_progress', 'high', '2025-02-01', p1.lastInsertRowid, carol.lastInsertRowid, alice.lastInsertRowid);
  insertTask.run('SEO audit', 'Run full SEO audit and fix issues', 'todo', 'medium', '2025-02-15', p1.lastInsertRowid, bob.lastInsertRowid, alice.lastInsertRowid);

  insertTask.run('User authentication flow', 'Implement login, signup, and OAuth', 'in_progress', 'high', '2025-01-20', p2.lastInsertRowid, bob.lastInsertRowid, bob.lastInsertRowid);
  insertTask.run('Push notifications', 'Set up push notification service', 'todo', 'medium', '2025-02-10', p2.lastInsertRowid, carol.lastInsertRowid, bob.lastInsertRowid);

  // Seed comments
  const insertComment = db.prepare(
    `INSERT INTO comments (content, task_id, author_id) VALUES (?, ?, ?)`
  );

  insertComment.run('Mockups are looking great! One small change needed on mobile view.', t1.lastInsertRowid, alice.lastInsertRowid);
  insertComment.run('Updated the mobile breakpoints. Should be good now.', t1.lastInsertRowid, bob.lastInsertRowid);
  insertComment.run('Currently working on the hamburger menu animation.', t2.lastInsertRowid, carol.lastInsertRowid);

  console.log('✅ Seed complete!');
  console.log('   Users: alice@example.com, bob@example.com, carol@example.com');
  console.log('   Password: password123');
}

seed().then(() => process.exit(0)).catch(console.error);
