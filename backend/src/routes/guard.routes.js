
import express from 'express';
import GuardController from '../controllers/guard.controller.js';
import { authMiddleware, isOwnerOrAdmin } from '../middleware/auth.middleware.js'; 
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Rutas públicas (para admin y guardias)
router.get('/', authorize(['admin', 'guardia']), GuardController.getAllGuards);
router.get('/available', authorize(['admin', 'guardia']), GuardController.findAvailableGuards);
router.get('/:id', authorize(['admin', 'guardia']), GuardController.getGuardById);
router.get('/:id/stats', authorize(['admin', 'guardia']), GuardController.getGuardStats);

// Rutas que pueden usar los guardias para actualizar su propia información
router.patch('/:id/availability', 
  isOwnerOrAdmin('id'), // Usa isOwnerOrAdmin en lugar de la función inline
  GuardController.toggleAvailability
);

// Rutas protegidas (solo admin)
//CREAR GUARDIA
router.post('/', authorize(['admin']), GuardController.createGuard);
//ACTUALIZAR
router.put('/:id', authorize(['admin']), GuardController.updateGuard);
//DESACTIVARLO
router.patch('/:id/deactivate', authorize(['admin']), GuardController.deactivateGuard);
//ACTIVARLO
router.patch('/:id/activate', authorize(['admin']), GuardController.activateGuard);

export default router;