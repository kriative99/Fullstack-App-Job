import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { getAllUsers, getStats } from '../controllers/userController';

const router = Router();

router.get('/', authenticate, getAllUsers);
router.get('/stats', authenticate, requireAdmin, getStats);

export default router;
