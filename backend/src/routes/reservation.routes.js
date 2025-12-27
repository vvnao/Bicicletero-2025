'use strict';
import { Router } from 'express';
import {createReservation,cancelReservationController,getUserReservationsController,getUserBicyclesForReservation,} from '../controllers/reservation.controller.js';
import {authMiddleware} from '../middleware/auth.middleware.js';

const router = Router();

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
  //isOwnerOrAdmin('userId'),
  getUserReservationsController
);

router.get(
  '/user/:userId/bicycles',
  authorize(['admin', 'guardia', 'user']),
  isOwnerOrAdmin('userId'),
  getUserBicyclesForReservation
);
export default router;