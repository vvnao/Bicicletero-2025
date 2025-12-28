'use strict';
import { Router } from 'express';
import {
  getSpaceDetails,
  getUserByRut,
} from '../controllers/spaceDetails.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/:spaceId',
  authorize(['admin', 'guardia', 'user']),
  getSpaceDetails
);

router.get('/user/:rut', authorize(['admin', 'guardia']), getUserByRut);

export default router;
