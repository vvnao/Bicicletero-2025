// routes/history.routes.js
'use strict';

import { Router } from 'express';
import { 
    getHistoryController, 
    getHistoryStatisticsController, 
    exportHistoryController 
} from '../controllers/history.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener historial con filtros (admin y guardia)
router.get('/', getHistoryController);

// Obtener estadísticas del historial (admin y guardia)
router.get('/statistics', getHistoryStatisticsController);

// Exportar historial (solo admin)
router.get('/export', exportHistoryController);

export default router;