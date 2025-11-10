import { Router } from "express";
import { 
    listBikeracks, 
    assignGuardController, 
    storeBicycleController, 
    removeBicycleController 
} from "../controllers/bikerack.controller.js"; 

const router = Router();

// Listar bicicleteros con ocupación
router.get("/", listBikeracks);

// Asignar guardia
router.put("/:bikerackId/assign-guard/:guardId", assignGuardController);

// Guardar bicicleta en bicicletero
router.put("/:bikerackId/store/:bicycleId", storeBicycleController);

// Retirar bicicleta
router.put("/remove/:bicycleId", removeBicycleController);

export default router;
