import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import {uploadDocuments, handleFileSizeLimit } from "../middleware/multer.middleware.js";


const router = Router();

router.post("/register", uploadDocuments, handleFileSizeLimit, register);
router.post("/login", login);

export default router;


