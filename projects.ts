import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAllProjects, getProjectById, createProject, updateProject, deleteProject
} from '../controllers/projectController';
import taskRoutes from './tasks';

const router = Router();

router.use(authenticate);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Nested task routes
router.use('/:projectId/tasks', taskRoutes);

export default router;
