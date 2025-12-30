import { Router } from "express";
import { createBicycle, getBicycles, getAllBicycles, deleteBicycles, updateBicycles, getBicyclesByUserId, deleteBicyclesSoft} from "../controllers/bicycle.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js";
import {uploadDocuments, handleFileSizeLimit } from "../middleware/multer.middleware.js";

const router = Router()

router.post("/", authMiddleware,uploadDocuments,handleFileSizeLimit, createBicycle);
router.get("/",authMiddleware, getBicycles);
router.get("/all", getAllBicycles);
router.delete("/", authMiddleware, deleteBicycles);
router.delete("/soft/:bicycleId", authMiddleware, deleteBicyclesSoft);
router.patch("/:id", authMiddleware,uploadDocuments,handleFileSizeLimit, updateBicycles);
router.get("/user/:id", authMiddleware, getBicyclesByUserId);

export default router;