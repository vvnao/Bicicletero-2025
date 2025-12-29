'use strict';

import { Router } from 'express';
import { generateBikerackReport } from '../controllers/reports.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Generar reporte de ingresos y salidas
router.get('/bikerack', authorize(['admin', 'guardia']), generateBikerackReport);

export default router;