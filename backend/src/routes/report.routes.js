'use strict';

import { Router } from 'express';
import { 
    generateWeeklyReportController,
    getBikerackWeeklyReportController
} from '../controllers/reports.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

//~ Todas las rutas requieren autenticación
router.use(authMiddleware);

//~ Reporte semanal general (solo admin) con tipo de reporte
router.get('/weekly', generateWeeklyReportController);

//~ Reporte semanal por bicicletero (admin y guardia) con tipo de reporte
router.get('/weekly/bikerack/:bikerackId', getBikerackWeeklyReportController);

export default router;