// routes/bikerack.routes.js - ORDEN CORRECTO DE RUTAS
import express from 'express';
import { 
  getDashboard,
  getBikerackSpaces,
  listBikeracks,
  storeBicycleInBikerack,
  removeBicycleFromBikerack,
  getAllBikeracks
} from '../controllers/bikerack.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { getAllBicycles } from '../controllers/bicycle.controller.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// ⚠️ IMPORTANTE: Las rutas más específicas PRIMERO, las genéricas DESPUÉS
// ⚠️ Rutas con nombre específico (como /dashboard) deben ir ANTES de las rutas con parámetros (como /:id)
//! RUTAS ESPECÍFICAS (van primero)
router.get('/dashboard', authorize(['admin', 'guardia', 'user']), getDashboard);

//! RUTAS DE ACCIONES (con nombres específicos)
router.post('/store-bicycle', authorize(['admin', 'guardia', 'user']), storeBicycleInBikerack);
router.post('/remove-bicycle', authorize(['admin', 'guardia', 'user']), removeBicycleFromBikerack);
router.get('/all', getAllBikeracks);
//! RUTAS GENERALES
// GET /api/bikeracks - Listar todos los bicicleteros
router.get('/', authorize(['admin', 'guardia', 'user']), listBikeracks);

//! RUTAS CON PARÁMETROS (van al final)
// GET /api/bikeracks/:bikerackId - Obtener espacios de un bicicletero específico
router.get('/:bikerackId', authorize(['admin', 'guardia', 'user']), getBikerackSpaces);

export default router;