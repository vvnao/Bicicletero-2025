import { Router } from "express";
import { createBicycle, getBicycles, getAllBicycles, deleteBicycles, updateBicycles, getBicyclesByUserId} from "../controllers/bicycle.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router()

router.post("/", authMiddleware, createBicycle);
router.get("/",authMiddleware, getBicycles);
router.get("/all", getAllBicycles);
router.delete("/", authMiddleware, deleteBicycles);
router.put("/", authMiddleware, updateBicycles);
router.get("/user/:id", authMiddleware, getBicyclesByUserId);

export default router;