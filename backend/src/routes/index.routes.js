// router.js
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
import reservationRoutes from './reservation.routes.js';
import spaceDetailsRoutes from './spaceDetails.routes.js';
import guardRoutes from './guard.routes.js';
import guardAssignmentRoutes from './guardAssignment.routes.js'; // Nueva

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  // Orden alfabético
  router.use("/auth", authRoutes);
  router.use("/bicycles", bicycleRoutes);
  router.use("/bikeracks", bikerackRoutes);
  router.use("/guard-assignments", guardAssignmentRoutes); // ✅ Nueva
  router.use("/guards", guardRoutes);
  router.use("/history", historyRoutes);
  router.use("/profile", profileRoutes);
  router.use("/reports", reportRoutes);
  router.use("/reservations", reservationRoutes);
  router.use("/spaces", spaceManagementRoutes);
  router.use("/space-details", spaceDetailsRoutes);
  router.use("/user-request-history", userRequestHistoryRoutes);
}