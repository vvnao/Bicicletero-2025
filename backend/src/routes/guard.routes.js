// routes/guard.routes.js - VERSIÓN FINAL CON PERMISOS
import express from 'express';
import GuardController from '../controllers/guard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js'; 
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// ================================================
// RUTAS DE GUARDIAS - CRUD COMPLETO
// ================================================

// 1. CREAR GUARDIA - SOLO ADMIN
router.post('/', authorize(['admin']), GuardController.createGuard);

// 2. OBTENER TODOS LOS GUARDIAS - ADMIN Y GUARDIA
router.get('/', authorize(['admin', 'guardia']), GuardController.getAllGuards);

// 3. OBTENER GUARDIAS DISPONIBLES - ADMIN Y GUARDIA
router.get('/available', authorize(['admin', 'guardia']), GuardController.findAvailableGuards);

// 4. OBTENER GUARDIA POR ID - ADMIN Y GUARDIA (solo su propio perfil)
router.get('/:id', authorize(['admin', 'guardia']), GuardController.getGuardById);

// 5. ACTUALIZAR GUARDIA - ADMIN (todo) o GUARDIA (solo campos permitidos)
router.put('/:id', authorize(['admin', 'guardia']), GuardController.updateGuard);

// 6. DESACTIVAR GUARDIA - SOLO ADMIN
router.patch('/:id/deactivate', authorize(['admin']), GuardController.deactivateGuard);

// 7. ACTIVAR GUARDIA - SOLO ADMIN
router.patch('/:id/activate', authorize(['admin']), GuardController.activateGuard);

// 8. OBTENER ESTADÍSTICAS - ADMIN Y GUARDIA (solo su propio perfil)
router.get('/:id/stats', authorize(['admin', 'guardia']), GuardController.getGuardStats);

// 9. CAMBIAR DISPONIBILIDAD - ADMIN y el propio guardia
router.patch('/:id/availability', GuardController.toggleAvailability);

export default router;