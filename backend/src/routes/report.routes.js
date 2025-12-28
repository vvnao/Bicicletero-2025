// routes/reports.routes.js
'use strict';

import { Router } from 'express';
import { 
    generateWeeklyReportController,
    getBikerackWeeklyReportController,
    getReportsHistoryController,
    generateAuditReportController 
} from '../controllers/reports.controller.js';
import { authMiddleware, isAdmin, isAdminOrGuard } 
from '../middleware/auth.middleware.js';
const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// REPORTES DE AUDITORÍA - solo admin
router.get('/audit', isAdmin, generateAuditReportController);

// REPORTES SEMANALES
router.get('/weekly', isAdmin, generateWeeklyReportController);
router.get('/weekly/bikerack/:bikerackId', isAdminOrGuard, getBikerackWeeklyReportController);

// HISTORIAL DE REPORTES - solo admin
router.get('/history', isAdmin, getReportsHistoryController);

export default router;