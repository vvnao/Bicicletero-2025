'use strict';
import { Router } from 'express';
import {
  occupyWithReservation,
  occupyWithoutReservation,
  liberateSpaceController,
} from '../controllers/spaceManagement.controller.js';

const router = Router();

router.post('/occupy-with-reservation', occupyWithReservation);
router.post('/:spaceId/occupy-without-reservation', occupyWithoutReservation);
router.patch('/:spaceId/liberate', liberateSpaceController);

export default router;
