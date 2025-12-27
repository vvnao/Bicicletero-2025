// routes/bikerack.routes.js
'use strict';
import { Router } from 'express';
import {
  getDashboard,
  getBikerackSpaces,
  listBikeracks, 
  storeBicycleInBikerack, 
  removeBicycleFromBikerack
} from '../controllers/bikerack.controller.js';
import { authMiddleware, isAdmin, isGuard, isAdminOrGuard } from '../middleware/auth.middleware.js';

const router = Router();

// Middleware de autenticación global
router.use(authMiddleware);

// Rutas que requieren admin o guardia
router.get('/dashboard', isAdminOrGuard, getDashboard);
router.get('/:id', isAdminOrGuard, getBikerackSpaces);
router.get('/', isAdminOrGuard, listBikeracks); // Solo admin o guardia

// Rutas para todos los usuarios autenticados (admin, guardia, user)
router.post("/store-bicycle", storeBicycleInBikerack);
router.post("/remove-bicycle", removeBicycleFromBikerack);

export default router;