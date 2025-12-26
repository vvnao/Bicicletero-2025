// routes/guardAssignment.routes.js - SIMPLIFICADO
import express from 'express';
import { GuardAssignmentController } from '../controllers/guardAssignment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();
const controller = new GuardAssignmentController();

router.use(authMiddleware);

// RUTAS
router.post('/', authorize(['admin']), (req, res) => controller.create(req, res));
router.get('/check-availability', authorize(['admin']), (req, res) => controller.checkAvailability(req, res));
router.get('/guard/:guardId', authorize(['admin', 'guardia']), (req, res) => controller.getByGuard(req, res));
router.get('/', authorize(['admin', 'guardia']), (req, res) => controller.getAllActiveAssignments(req, res));

// Ruta por ID de asignación
router.get('/:id', authorize(['admin', 'guardia']), (req, res) => controller.getAssignmentById(req, res));

export default router;