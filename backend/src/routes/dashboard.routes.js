// backend/src/routes/dashboard.routes.js
import { Router } from 'express';
import { 
  getDashboardSummary, 
  getMetrics, 
  getCapacity, 
  getGuards, 
  getActivity, 
  getIncidents 
} from '../controllers/dashboard.controller.js';
import { authMiddleware, isAdmin } from '../middleware/auth.middleware.js'; 

const router = Router();

// Ruta principal - Obtiene todos los datos del dashboard (solo admins)
router.get('/summary', authMiddleware, isAdmin, getDashboardSummary);

// Rutas individuales (opcionales) - también solo admins
router.get('/metrics', authMiddleware, isAdmin, getMetrics);
router.get('/capacity', authMiddleware, isAdmin, getCapacity);
router.get('/guards', authMiddleware, isAdmin, getGuards);
router.get('/activity', authMiddleware, isAdmin, getActivity);
router.get('/incidents', authMiddleware, isAdmin, getIncidents);

export default router;