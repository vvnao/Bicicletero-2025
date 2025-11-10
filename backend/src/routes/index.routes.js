import { Router } from "express";
import authRoutes from "./auth.routes.js";
import bicycleRoutes from "./bicycle.routes.js";
import profileRoutes from "./profile.routes.js";
import bikerackRoutes from "./bikerack.routes.js";
import { getWeeklyReport } from "../controllers/report.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";




export function routerApi(app) {
  const router = Router();
  app.use("/api", router);
  router.get("/reports/weekly", authMiddleware, getWeeklyReport);


  router.use("/auth", authRoutes);
  router.use("/bicycles", bicycleRoutes);
  router.use("/profile", profileRoutes );
  router.use("/bikeracks", bikerackRoutes);

}
