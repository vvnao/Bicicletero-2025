'use strict';
// routes/history.routes.js - CORREGIDO
import { Router } from 'express';
import historyController from '../controllers/history.controller.js';
import HistoryEntity from '../entities/HistoryEntity.js'; // Asegúrate que NO tenga llaves {} si es export default
import { authMiddleware, isAdmin } from '../middleware/auth.middleware.js';
const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// --- RUTAS DE HISTORIAL ---

// 1. Historial General (con filtros por query params)
router.get('/', historyController.getHistory);

// 2. Historiales por Entidad (Misión: Separación)
router.get('/user/:userId', historyController.getSpecificUserHistory);
router.get('/guard/:guardId', historyController.getSpecificGuardHistory);
router.get('/bicycle/:bicycleId', historyController.getSpecificBicycleHistory);
router.get('/bikerack/:bikerackId', historyController.getSpecificBikerackHistory);

// 3. Estadísticas y Actividad Reciente
router.get('/statistics', historyController.getStatistics);
router.get('/recent', historyController.getRecentActivity);

// 4. Mantenimiento (Solo Admin)
router.delete('/clean', historyController.cleanHistory);
router.get('/export', historyController.exportHistory);

router.get("/occupancy", isAdmin, historyController.getBicycleUsage);

router.get("/guards", isAdmin, historyController.getGuardsHistory);
router.get("/management", isAdmin, historyController.getManagementMovements);
export default router;