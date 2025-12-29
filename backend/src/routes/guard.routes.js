// routes/guard.routes.js
import { Router } from 'express';
import guardController from '../controllers/guard.controller.js';
import { authMiddleware, isAdmin, isAdminOrGuard } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas
router.post('/', isAdmin, guardController.createGuard);
router.get('/', isAdminOrGuard, guardController.getAllGuards);
router.get('/:id', isAdminOrGuard, guardController.getGuardById);
router.put('/:id', isAdminOrGuard, guardController.updateGuard);


router.patch('/:id/availability', isAdminOrGuard, guardController.toggleAvailability);
router.patch('/:id/toggle-availability', isAdminOrGuard, guardController.toggleAvailability);

router.patch('/:id/deactivate', isAdmin, guardController.deactivateGuard);
router.patch('/:id/activate', isAdmin, guardController.activateGuard);
router.get('/:id/stats', isAdminOrGuard, guardController.getGuardStats);
router.get('/available/find', isAdminOrGuard, guardController.findAvailableGuards);

export default router;