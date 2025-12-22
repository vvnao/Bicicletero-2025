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

//------------ASIGNACIONES DE GUARDIAS (SISTEMA DEFINITIVO)---------------
// CREAR ASIGNACIÓN CON HORARIOS
router.post('/assignments', (req, res) => guardAssignmentController.create(req, res));
// OBTENER ASIGNACIONES DE GUARDIAS EN UN BICICLETERO
router.get('/:bikerackId/assignments', (req, res) => guardAssignmentController.getByBikerack(req, res));
// OBTENER ASIGNACIONES DE UN GUARDIA
router.get('/guards/:guardId/assignments', (req, res) => guardAssignmentController.getByGuard(req, res));
// DESACTIVAR ASIGNACIÓN
router.patch('/assignments/:assignmentId/deactivate', (req, res) => guardAssignmentController.deactivate(req, res));
// ACTUALIZAR ASIGNACIONES DE UN BICICLETERO
router.put('/assignments/:assignmentId', (req, res) => guardAssignmentController.update(req, res));

export default router;