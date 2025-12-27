'use strict';
import { Router } from 'express';
import {createReservation,cancelReservationController,getUserReservationsController,getUserBicyclesForReservation,} from '../controllers/reservation.controller.js';
import {authMiddleware} from '../middleware/auth.middleware.js';

const router = Router();

router.post('/create',authMiddleware,createReservation);
router.patch('/:reservationId/cancel',authMiddleware, cancelReservationController);
router.get('/user/:userId',authMiddleware, getUserReservationsController);
router.get('/user/:userId/bicycles',authMiddleware,getUserBicyclesForReservation);

export default router;