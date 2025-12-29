'use strict';
import { Router } from 'express';
import {
  createIncidenceReportController,
  getIncidenceFormOptionsController,
  getBikerackSpacesController,
  getMyIncidenceReportsController,
  searchUserByRutController,
  deleteIncidenceController,
  getIncidenceByIdController,
} from '../controllers/incidence.controller.js';
import {
  uploadIncidenceEvidence,
  handleEvidenceUploadError,
} from '../middleware/multer.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/report',
  authorize(['guardia']),
  uploadIncidenceEvidence,
  handleEvidenceUploadError,
  createIncidenceReportController
);
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

router.get('/search-by-rut', authorize(['guardia']), searchUserByRutController);

router.get('/:id', authorize(['guardia']), getIncidenceByIdController);

router.delete('/:id', authorize(['guardia']), deleteIncidenceController);

export default router;
