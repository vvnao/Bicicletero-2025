import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';

const router = Router();

// Endpoint principal para alimentar todos los componentes de tus imágenes
router.get('/summary', getDashboardData);

export default router;