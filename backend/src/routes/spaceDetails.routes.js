'use strict';
import { Router } from 'express';
import { getSpaceDetails } from '../controllers/spaceDetails.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/:spaceId',
  authorize(['admin', 'guardia', 'user']),
  getSpaceDetails
);

export default router;
