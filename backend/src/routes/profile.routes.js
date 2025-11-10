import { Router } from "express";
import { getPrivateProfile } from "../controllers/profile.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/",authMiddleware, getPrivateProfile);

export default router;