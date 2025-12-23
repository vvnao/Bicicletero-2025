'use strict';
import { Router } from 'express';
import { GuardAssignmentController } from '../controllers/guardAssignment.controller.js';
import {
  getDashboard,
  getBikerackSpaces,
  listBikeracks, 
  storeBicycleInBikerack, 
  removeBicycleFromBikerack
} from '../controllers/bikerack.controller.js';

const router = Router();
const guardAssignmentController = new GuardAssignmentController();

//------------DASHBOARD Y DETALLES---------------
router.get('/dashboard', getDashboard);
router.get('/:id', getBikerackSpaces);

//------------BICICLETERO----------
router.get("/", listBikeracks);
router.post("/store-bicycle", storeBicycleInBikerack);
router.post("/remove-bicycle", removeBicycleFromBikerack);



export default router;