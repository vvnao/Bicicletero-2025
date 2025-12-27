// routes/guard.routes.js
import express from 'express';
import GuardController from '../controllers/guard.controller.js';
import { authMiddleware, isAdmin, isAdminOrGuard, isOwnerOrAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware de autenticación global
router.use(authMiddleware);

// 1. CREAR GUARDIA - SOLO ADMIN
router.post('/', isAdmin, GuardController.createGuard);

// 2. OBTENER TODOS LOS GUARDIAS - ADMIN Y GUARDIA
router.get('/', isAdminOrGuard, GuardController.getAllGuards);

// 3. OBTENER GUARDIAS DISPONIBLES - ADMIN Y GUARDIA
router.get('/available', isAdminOrGuard, GuardController.findAvailableGuards);

// 4. OBTENER GUARDIA POR ID - ADMIN Y GUARDIA (solo su propio perfil)
router.get('/:id', isOwnerOrAdmin('id'), GuardController.getGuardById);

// 5. ACTUALIZAR GUARDIA - ADMIN (todo) o GUARDIA (solo campos permitidos)
router.put('/:id', isOwnerOrAdmin('id'), GuardController.updateGuard);

// 6. DESACTIVAR GUARDIA - SOLO ADMIN
router.patch('/:id/deactivate', isAdmin, GuardController.deactivateGuard);

// 7. ACTIVAR GUARDIA - SOLO ADMIN
router.patch('/:id/activate', isAdmin, GuardController.activateGuard);

// 8. OBTENER ESTADÍSTICAS - ADMIN Y GUARDIA (solo su propio perfil)
router.get('/:id/stats', isOwnerOrAdmin('id'), GuardController.getGuardStats);

// 9. CAMBIAR DISPONIBILIDAD - ADMIN y el propio guardia
router.patch('/:id/availability', isOwnerOrAdmin('id'), GuardController.toggleAvailability);

export default router;