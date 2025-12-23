'use strict';
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import bikerackRoutes from "./bikerack.routes.js";
import bicycleRoutes from "./bicycle.routes.js";
import profileRoutes from "./profile.routes.js";
import reportRoutes from "./report.routes.js";     
import historyRoutes from "./history.routes.js";
import userRequestHistoryRoutes from "./userRequestHistory.routes.js";
import spaceManagementRoutes from './spaceManagement.routes.js';

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/reports", reportRoutes);
  router.use("/auth", authRoutes);
  router.use("/bicycles", bicycleRoutes);
  router.use("/profile", profileRoutes );
  router.use("/bikeracks", bikerackRoutes);
  router.use("/history", historyRoutes);
  router.use("/user-request-history", userRequestHistoryRoutes);
  router.use('/spaces', spaceManagementRoutes); 
}
