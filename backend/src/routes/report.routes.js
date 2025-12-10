// routes/report.routes.js
'use strict';

import { Router } from 'express';
import { 
    generateWeeklyReportController,
    getBikerackWeeklyReportController,
    generateRedistributionPlanController,
    executeRedistributionController
} from '../controllers/reports.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

//~ Todas las rutas requieren autenticación
router.use(authMiddleware);

//~ Reporte semanal general (solo admin)
router.get('/weekly', generateWeeklyReportController);

//~ Reporte semanal por bicicletero (admin y guardia)
router.get('/weekly/bikerack/:bikerackId', getBikerackWeeklyReportController);

//~ Generar plan de redistribución (solo admin)
router.post('/redistribute/plan', generateRedistributionPlanController);

//~ Ejecutar redistribución (solo admin)
router.post('/redistribute/execute', executeRedistributionController);

export default router;