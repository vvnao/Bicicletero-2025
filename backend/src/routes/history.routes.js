import { Router } from "express";
import { getHistoryController } from "../controllers/history.controller.js";

const router = Router();

router.get("/", getHistoryController);

export default router;
