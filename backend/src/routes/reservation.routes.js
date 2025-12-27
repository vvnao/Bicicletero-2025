'use strict';
import { Router } from 'express';
import {createReservation,cancelReservationController,getUserReservationsController,getUserBicyclesForReservation,} from '../controllers/reservation.controller.js';
import {authMiddleware} from '../middleware/auth.middleware.js';

const router = Router();

router.post('/create',createReservation);
router.patch('/:reservationId/cancel',cancelReservationController);
router.get('/user/:userId', getUserReservationsController);
router.get('/user/:userId/bicycles',getUserBicyclesForReservation);

export default router;