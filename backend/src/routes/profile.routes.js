import { Router } from "express";
import { getPrivateProfile, getProfiles, updatePrivateProfile} from "../controllers/profile.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/",authMiddleware, getPrivateProfile);
router.get("/all", authMiddleware, getProfiles );
router.put("/", authMiddleware, updatePrivateProfile);



export default router;