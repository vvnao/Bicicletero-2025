'use strict';
import { Router } from 'express';
import { getSpaceDetails } from '../controllers/spaceDetails.controller.js';

const router = Router();

router.get('/:spaceId', getSpaceDetails);

export default router;
