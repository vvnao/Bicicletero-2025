'use strict';
import { Router } from 'express';
import { GuardAssignmentController } from '../controllers/guardAssignment.controller.js';
import {
  getDashboard,
  getBikerackSpaces,
  listBikeracks, 
  assignGuardToBikerack, 
  storeBicycleInBikerack, 
  removeBicycleFromBikerack,
  
  
} from '../controllers/bikerack.controller.js';

const router = Router();
const guardAssignmentController = new GuardAssignmentController();

router.get('/dashboard', getDashboard);
router.get('/:id', getBikerackSpaces);

//------------BICICLETERO----------
// Listar bicicleteros con ocupación
router.get("/", listBikeracks);
// Guardar bicicleta en bicicletero
router.post("/store-bicycle", storeBicycleInBikerack);
// Guardar bicicleta en bicicletero
router.post("/store-bicycle", storeBicycleInBikerack);


//---------GUARDIAS---------------
// ASIGNAR GUARDIA CON HORARIOS (NUEVO)
router.post('/assignments', (req, res) => guardAssignmentController.create(req, res));
// OBTENER ASIGNACIONES DE UN BICICLETERO
router.get('/:bikerackId/assignments', (req, res) => guardAssignmentController.getByBikerack(req, res));
// OBTENER ASIGNACIONES DE UN GUARDIA
router.get('/guards/:guardId/assignments', (req, res) => guardAssignmentController.getByGuard(req, res));
// DESACTIVAR ASIGNACIÓN
router.patch('/assignments/:assignmentId/deactivate', (req, res) => guardAssignmentController.deactivate(req, res));


export default router;