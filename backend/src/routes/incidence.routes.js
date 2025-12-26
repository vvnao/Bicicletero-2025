'use strict';
import { Router } from 'express';
import {
  createIncidenceReportController,
  getIncidenceFormOptionsController,
  getBikerackSpacesController,
  getMyIncidenceReportsController,
} from '../controllers/incidence.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/report', authorize(['guardia']), createIncidenceReportController);
router.get(
  '/options',
  authorize(['guardia']),
  getIncidenceFormOptionsController
);
router.get(
  '/bikeracks/:bikerackId/spaces',
  authorize(['guardia']),
  getBikerackSpacesController
);
router.get(
  '/my-reports',
  authorize(['guardia']),
  getMyIncidenceReportsController
);

export default router;
