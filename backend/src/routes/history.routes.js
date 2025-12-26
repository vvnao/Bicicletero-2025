// routes/history.routes.js
'use strict';

import { Router } from 'express';
import HistoryController from '../controllers/history.controller.js';
import { authMiddleware} from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

// Middleware de autenticación
router.use(authMiddleware);

// ================================================
// HISTORIAL GENERAL Y ESPECÍFICO
// ================================================

// Historial completo con filtros - Esta es la ruta principal
router.get('/', authorize(['admin', 'guardia']), (req, res) => 
    HistoryController.getHistory(req, res));

// Historial general (todos) - Nuevo endpoint para tabla completa
router.get('/all', authorize(['admin', 'guardia']), (req, res) => 
    HistoryController.getAllHistory(req, res));

// Actividad reciente
router.get('/recent', authorize(['admin', 'guardia']), (req, res) => 
    HistoryController.getRecentActivity(req, res));

// Estadísticas
router.get('/statistics', authorize(['admin', 'guardia']), (req, res) => 
    HistoryController.getStatistics(req, res));

// Exportar historial
router.get('/export', authorize(['admin']), (req, res) => 
    HistoryController.exportHistory(req, res));

// Limpiar historial antiguo
router.delete('/clean', authorize(['admin']), (req, res) => 
    HistoryController.cleanHistory(req, res));

// ================================================
// HISTORIAL ESPECÍFICO (con rutas separadas)
// ================================================

// Historial de usuarios (todos los usuarios)
router.get('/users', authorize(['admin', 'guardia']), (req, res) => 
    HistoryController.getAllUserHistory(req, res));

// Historial de usuario específico
router.get('/users/:userId', (req, res) => 
    HistoryController.getSpecificUserHistory(req, res));

// Historial de guardias (todos los guardias)
router.get('/guards', authorize(['admin', 'guardia']), (req, res) => 
    HistoryController.getAllGuardHistory(req, res));

// Historial de guardia específico
router.get('/guards/:guardId', (req, res) => 
    HistoryController.getSpecificGuardHistory(req, res));

// Historial de bicicletas (todas las bicicletas)
router.get('/bicycles', authorize(['admin', 'guardia']), (req, res) => 
    HistoryController.getAllBicycleHistory(req, res));

// Historial de bicicleta específica
router.get('/bicycles/:bicycleId', (req, res) => 
    HistoryController.getSpecificBicycleHistory(req, res));

// Historial de bicicleteros (todos los bicicleteros)
router.get('/bikeracks', authorize(['admin', 'guardia']), (req, res) => 
    HistoryController.getAllBikerackHistory(req, res));

// Historial de bicicletero específico
router.get('/bikeracks/:bikerackId', (req, res) => 
    HistoryController.getSpecificBikerackHistory(req, res));

// ================================================
// CREAR REGISTROS (para integración con otros servicios)
// ================================================

// Crear registro manual (para testing/integración)
router.post('/record', authorize(['admin', 'guardia']), (req, res) => 
    HistoryController.createHistoryRecord(req, res));

export default router;