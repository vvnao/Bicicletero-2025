'use strict';
import { Router } from 'express';
import {
  createReservation,
  cancelReservationController,
  getUserReservationsController,
  getUserBicyclesForReservation,
} from '../controllers/reservation.controller.js';
import { authorize } from '../middleware/authorize.middleware.js'; 
import { 
  authMiddleware, 
  isOwnerOrAdmin 
} from '../middleware/auth.middleware.js';

// 1. PRIMERO crear el router
const router = Router();

// 2. LUEGO aplicar middleware global
router.use(authMiddleware);

// 3. FINALMENTE definir rutas
router.post(
  '/create',
  authorize(['user', 'admin', 'guardia']),
  createReservation
);

router.patch(
  '/:reservationId/cancel',
  authorize(['user', 'admin', 'guardia']),
  cancelReservationController
);

router.get(
  '/user/:userId',
  authorize(['admin', 'guardia', 'user']),
  //isOwnerOrAdmin('userId'),  // Descomenta cuando funcione
  getUserReservationsController
);

router.get(
  '/user/:userId/bicycles',
  authorize(['admin', 'guardia', 'user']),
  //isOwnerOrAdmin('userId'),  // Descomenta cuando funcione
  getUserBicyclesForReservation
);

export default router;