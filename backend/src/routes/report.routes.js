// routes/reports.routes.js - VERSIÓN CORREGIDA
'use strict';

import { Router } from 'express';
import { 
    generateWeeklyReportController,
    getBikerackWeeklyReportController,
    getReportsHistoryController,
    generateAuditReportController 
} from '../controllers/reports.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

//~ Todas las rutas requieren autenticación
router.use(authMiddleware);

// ================================================
// REPORTES DE AUDITORÍA
// ================================================

//~ Reporte de auditoría/consistencia (solo admin)
// GET /api/reports/audit?weekStart=2024-11-01&weekEnd=2024-11-07
router.get('/audit', authorize(['admin']), generateAuditReportController);

// ================================================
// REPORTES SEMANALES
// ================================================

//~ Reporte semanal general (solo admin)
// GET /api/reports/weekly?weekStart=2024-11-01&weekEnd=2024-11-07&reportType=uso_semanal
router.get('/weekly', authorize(['admin']), generateWeeklyReportController);

//~ Reporte semanal por bicicletero (admin y guardia)
// GET /api/reports/weekly/bikerack/1?weekStart=2024-11-01&weekEnd=2024-11-07&reportType=uso_semanal
router.get('/weekly/bikerack/:bikerackId', authorize(['admin', 'guardia']), getBikerackWeeklyReportController);

// ================================================
// HISTORIAL DE REPORTES
// ================================================

//~ Historial de reportes generados (solo admin)
// GET /api/reports/history
router.get('/history', authorize(['admin']), getReportsHistoryController);

export default router;