'use strict';
import { Router } from 'express';
import {createReservation,cancelReservationController,getUserReservationsController,getUserBicyclesForReservation} from '../controllers/reservation.controller.js';
import { getAllBikeracks } from '../controllers/bikerack.controller.js';
import { getAvailableSpacesController } from '../controllers/reservation.controller.js';
import { authorize } from '../middleware/authorize.middleware.js'; 
import { authMiddleware, isOwnerOrAdmin } from '../middleware/auth.middleware.js';

// 1. PRIMERO crear el router
const router = Router();
// 2. LUEGO aplicar middleware global
router.use(authMiddleware);
router.get('/all', getAllBikeracks);
router.get('/', getAvailableSpacesController);

// 3. FINALMENTE definir rutas
router.post('/create',authMiddleware,createReservation);
router.patch('/:reservationId/cancel', authMiddleware,cancelReservationController);

router.get('/user/:userId',authorize(['admin', 'guardia', 'user']),//isOwnerOrAdmin('userId'),  // Descomenta cuando funcionegetUserReservationsController
);

router.get(
  '/user/:userId/bicycles',
  authorize(['admin', 'guardia', 'user']),
  //isOwnerOrAdmin('userId'),  // Descomenta cuando funcione
  getUserBicyclesForReservation
);

export default router;
