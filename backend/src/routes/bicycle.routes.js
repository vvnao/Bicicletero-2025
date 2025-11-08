import Router from "express";
import { createBicycle } from "../controllers/bicycle.controller.js";

const router = Router()

router.post("/", createBicycle);

export default router;
