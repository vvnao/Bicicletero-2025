'use strict';
import { Router } from 'express';
import {
  getDashboard,
  getBikerackSpaces,
  listBikeracks,
  assignGuardController,
  storeBicycleController,
  removeBicycleController,
} from '../controllers/bikerack.controller.js';

const router = Router();

router.get('/dashboard', getDashboard);
router.get('/:bikerackId', getBikerackSpaces);
//////////////////////////////////////////
router.get('/', listBikeracks);
router.put('/:bikerackId/assign-guard/:guardId', assignGuardController);
router.put('/:bikerackId/store/:bicycleId', storeBicycleController);
router.put('/remove/:bicycleId', removeBicycleController);

export default router;
