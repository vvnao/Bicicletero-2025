// routes/bikerack.routes.js - VERSIÓN CORREGIDA
'use strict';
import { Router } from 'express';
import {
  listBikeracks,           // Función principal CORREGIDA
  getDashboard,           // Panel de monitoreo
  getBikerackSpaces,      // Espacios específicos
  getBikerackGuards,      // Guardias del bicicletero
  listBikeracksWithGuards, // Bicicleteros con guardias
  storeBicycleInBikerack,  // Almacenar bicicleta
  removeBicycleFromBikerack // Remover bicicleta
} from '../controllers/bikerack.controller.js';
import { authMiddleware, isAdmin, isGuard, isAdminOrGuard } from '../middleware/auth.middleware.js';

const router = Router();

// Middleware de autenticación global
router.use(authMiddleware);

// ==================== RUTAS PARA ADMIN/GUARDIA ====================
router.get('/', isAdminOrGuard, listBikeracks); // GET /api/bikeracks
router.get('/dashboard', isAdminOrGuard, getDashboard);
router.get('/:id', isAdminOrGuard, getBikerackSpaces); // GET /api/bikeracks/:id
router.get('/:bikerackId/guards', isAdminOrGuard, getBikerackGuards);
router.get('/with-guards/list', isAdminOrGuard, listBikeracksWithGuards);

// ==================== RUTAS PARA TODOS LOS USUARIOS ====================
router.post("/store-bicycle", storeBicycleInBikerack);
router.post("/remove-bicycle", removeBicycleFromBikerack);

export default router;