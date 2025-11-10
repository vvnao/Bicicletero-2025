import { Router } from "express";
import { createBicycle, getBicycles, getAllBicycles} from "../controllers/bicycle.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js";


const router = Router()

router.post("/", authMiddleware, createBicycle);
router.get("/",authMiddleware, getBicycles);
router.get("/all", getAllBicycles);


export default router;
