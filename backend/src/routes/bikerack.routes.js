'use strict';
import { Router } from 'express';
import {
  getDashboard,
  getBikerackSpaces,
  listBikeracks, 
  assignGuardToBikerack, 
  storeBicycleInBikerack, 
  removeBicycleFromBikerack,
  
  
} from '../controllers/bikerack.controller.js';

const router = Router();

router.get('/dashboard', getDashboard);
router.get('/:id', getBikerackSpaces);

// Listar bicicleteros con ocupación
router.get("/", listBikeracks);

// Asignar guardia a bicicletero
router.put("/assign-guard", assignGuardToBikerack);

// Guardar bicicleta en bicicletero
router.post("/store-bicycle", storeBicycleInBikerack);


export default router;