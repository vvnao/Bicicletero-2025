'use strict';
import { Router } from 'express';
import {
  createReservation,
  cancelReservationController,
  getUserReservationsController,
} from '../controllers/reservation.controller.js';

const router = Router();

router.post('/create', createReservation);
router.patch('/:reservationId/cancel', cancelReservationController);
router.get('/user/:userId', getUserReservationsController);

export default router;
