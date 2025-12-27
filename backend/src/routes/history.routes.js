// routes/history.routes.js
'use strict';

import { Router } from 'express';
import HistoryController from '../controllers/history.controller.js';
import { authMiddleware, isAdmin, isAdminOrGuard } from '../middleware/auth.middleware.js';

const router = Router();

// Middleware de autenticación global
router.use(authMiddleware);

// HISTORIAL GENERAL Y ESPECÍFICO
router.get('/', isAdminOrGuard, (req, res) => HistoryController.getHistory(req, res));
router.get('/all', isAdminOrGuard, (req, res) => HistoryController.getAllHistory(req, res));
router.get('/recent', isAdminOrGuard, (req, res) => HistoryController.getRecentActivity(req, res));
router.get('/statistics', isAdminOrGuard, (req, res) => HistoryController.getStatistics(req, res));
router.get('/export', isAdmin, (req, res) => HistoryController.exportHistory(req, res));
router.delete('/clean', isAdmin, (req, res) => HistoryController.cleanHistory(req, res));

// HISTORIAL ESPECÍFICO
router.get('/users', isAdminOrGuard, (req, res) => HistoryController.getAllUserHistory(req, res));
router.get('/users/:userId', isAdminOrGuard, (req, res) => HistoryController.getSpecificUserHistory(req, res));
router.get('/guards', isAdminOrGuard, (req, res) => HistoryController.getAllGuardHistory(req, res));
router.get('/guards/:guardId', isAdminOrGuard, (req, res) => HistoryController.getSpecificGuardHistory(req, res));
router.get('/bicycles', isAdminOrGuard, (req, res) => HistoryController.getAllBicycleHistory(req, res));
router.get('/bicycles/:bicycleId', isAdminOrGuard, (req, res) => HistoryController.getSpecificBicycleHistory(req, res));
router.get('/bikeracks', isAdminOrGuard, (req, res) => HistoryController.getAllBikerackHistory(req, res));
router.get('/bikeracks/:bikerackId', isAdminOrGuard, (req, res) => HistoryController.getSpecificBikerackHistory(req, res));

// CREAR REGISTROS
router.post('/record', isAdminOrGuard, (req, res) => HistoryController.createHistoryRecord(req, res));

export default router;