'use strict';
import { Router } from 'express';
import {
  getDashboard,
  getBikerackSpaces,
} from '../controllers/bikerack.controller.js';

const router = Router();

router.get('/dashboard', getDashboard);
router.get('/:id', getBikerackSpaces);

export default router;
