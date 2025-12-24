// routes/guardAssignment.routes.js - VERSIÓN CORREGIDA
import express from 'express';
import { GuardAssignmentController } from '../controllers/guardAssignment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();
const controller = new GuardAssignmentController();

// Middleware de autenticación
router.use(authMiddleware);

// ================================================
// ASIGNACIONES DE HORARIOS FIJOS
// ================================================

// Crear asignación (horario fijo semanal)
router.post('/', authorize(['admin']), controller.create.bind(controller));

// Verificar disponibilidad en un horario
router.get('/check-availability', authorize(['admin']), controller.checkAvailability.bind(controller));

// Obtener horario de un guardia
router.get('/guard/:guardId/schedule', authorize(['admin', 'guardia']), controller.getGuardSchedule.bind(controller));

// Obtener horario de un bicicletero
router.get('/bikerack/:bikerackId/schedule', authorize(['admin', 'guardia', 'user']), controller.getBikerackSchedule.bind(controller));

// ================================================
// OTRAS OPERACIONES
// ================================================

// Listar todas las asignaciones activas
router.get('/', authorize(['admin', 'guardia']), controller.getAllActiveAssignments.bind(controller));

// Obtener asignación por ID
router.get('/:id', authorize(['admin', 'guardia']), controller.getAssignmentById.bind(controller));

// Actualizar asignación
router.put('/:id', authorize(['admin']), controller.update.bind(controller));

// Desactivar asignación
router.patch('/:id/deactivate', authorize(['admin']), controller.deactivate.bind(controller));

// Asignaciones por bicicletero
router.get('/bikerack/:bikerackId', authorize(['admin', 'guardia']), controller.getByBikerack.bind(controller));

// Asignaciones por guardia
router.get('/guard/:guardId', authorize(['admin', 'guardia']), controller.getByGuard.bind(controller));


export default router;