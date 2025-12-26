'use strict';
import { Router } from 'express';
import {
  getDashboard,
  getBikerackSpaces,
  listBikeracks,
  storeBicycleInBikerack,
  removeBicycleFromBikerack,
} from '../controllers/bikerack.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.get('/:bikerackId', getBikerackSpaces);

//------------BICICLETERO----------
router.get('/', authorize(['admin', 'guard', 'user']), listBikeracks);
router.post(
  '/store-bicycle',
  authorize(['admin', 'guard', 'user']),
  storeBicycleInBikerack
);
router.post(
  '/remove-bicycle',
  authorize(['admin', 'guard', 'user']),
  removeBicycleFromBikerack
);

export default router;
