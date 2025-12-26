'use strict';
import { Router } from 'express';
import {
  occupyWithReservation,
  occupyWithoutReservation,
  liberateSpaceController,
} from '../controllers/spaceManagement.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/occupy-with-reservation',
  authorize(['admin', 'guardia']),
  occupyWithReservation
);

router.post(
  '/:spaceId/occupy-without-reservation',
  authorize(['admin', 'guardia']),
  occupyWithoutReservation
);

router.patch(
  '/:spaceId/liberate',
  authorize(['admin', 'guardia']),
  liberateSpaceController
);

export default router;
