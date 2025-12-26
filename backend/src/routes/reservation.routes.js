'use strict';
import { Router } from 'express';
import {authMiddleware} from "../middleware/auth.middleware.js";
import {createReservation,cancelReservationController,getUserReservationsController} from "../controllers/reserva.controller.js";

const router = Router();

router.post('/create', authMiddleware,createReservation);
router.patch('/:reservationId/cancel', authMiddleware, cancelReservationController);
router.get('/user', authMiddleware, getUserReservationsController);

export default router;
