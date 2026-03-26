import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTasksByProject, getTaskById, createTask, updateTask, deleteTask, addComment
} from '../controllers/taskController';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.get('/', getTasksByProject);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/comments', addComment);

export default router;
