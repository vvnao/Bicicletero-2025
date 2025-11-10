import { Router } from "express";
import {authMiddleware} from "../middleware/auth.middleware.js";
import { getWeeklyReport } from "../controllers/report.controller.js";

const router = Router();

router.get("/weekly",authMiddleware, getWeeklyReport);

export default router;