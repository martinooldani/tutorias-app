import express from 'express';
import { tutoresController } from '../controllers/tutores.controller.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.get('/api/tutores', authenticateToken, tutoresController.getAll);
router.get('/api/tutores/:id', authenticateToken, tutoresController.getOne);

export default router;