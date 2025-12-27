import { Router } from "express";
import { getPrivateProfile, getProfiles, softActivateProfile, softDeleteProfileUser, updatePrivateProfile} from "../controllers/profile.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js";
import {uploadDocuments, handleFileSizeLimit } from "../middleware/multer.middleware.js";

const router = Router();

router.get("/",authMiddleware, getPrivateProfile);
router.get("/all", authMiddleware, getProfiles );
router.patch("/", authMiddleware, uploadDocuments,handleFileSizeLimit,updatePrivateProfile);
router.delete("/disable", authMiddleware, softDeleteProfileUser);
router.delete("/active", authMiddleware, softActivateProfile);

export default router;