import { Router } from "express";
import { createBicycle } from "../controllers/bicycle.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router()

router.post("/", authMiddleware, createBicycle);

export default router;
