// routes/guardAssignment.routes.js 
import express from 'express';
import { GuardAssignmentController } from '../controllers/guardAssignment.controller.js';
import { authMiddleware, isAdmin, isAdminOrGuard } from '../middleware/auth.middleware.js';

const router = express.Router();
const controller = new GuardAssignmentController();

// Middleware de autenticación global
router.use(authMiddleware);

// RUTAS
// Crear asignación - SOLO ADMIN
router.post('/', isAdmin, (req, res) => controller.create(req, res));

// Verificar disponibilidad - SOLO ADMIN
router.get('/check-availability', isAdmin, (req, res) => controller.checkAvailability(req, res));

// Obtener asignaciones por guardia - ADMIN y el propio guardia
router.get('/guard/:guardId', isAdminOrGuard, (req, res) => controller.getByGuard(req, res));

// Obtener todas las asignaciones activas - ADMIN y GUARDIA
router.get('/', isAdminOrGuard, (req, res) => controller.getAllActiveAssignments(req, res));

// Obtener asignación por ID - ADMIN y GUARDIA
router.get('/:id', isAdminOrGuard, (req, res) => controller.getAssignmentById(req, res));

// Eliminar asignación - SOLO ADMIN
router.delete('/:id', isAdmin, (req, res) => controller.deleteAssignment(req, res));

export default router;