'use strict';
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import bikerackRoutes from "./bikerack.routes.js";
import bicycleRoutes from "./bicycle.routes.js";
import profileRoutes from "./profile.routes.js";

import reportRoutes from "../routes/report.routes.js";
import reviewRoutes from "../routes/review.routes.js"; 
import historyRoutes from "./history.routes.js";
import userRequestHistoryRoutes from "./userRequestHistory.routes.js";

import spaceManagementRoutes from './spaceManagement.routes.js';
import reservationRoutes from './reservation.routes.js';
import spaceDetailsRoutes from './spaceDetails.routes.js';


export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/reports", reportRoutes);
  router.use("/auth", authRoutes);
  router.use("/bicycles", bicycleRoutes);
  router.use("/profile", profileRoutes );
  router.use("/bikeracks", bikerackRoutes);

  router.use("/reviews", reviewRoutes);

  router.use("/history", historyRoutes);
  router.use("/user-request-history", userRequestHistoryRoutes);

  router.use('/spaces', spaceManagementRoutes); 
  router.use('/reservations', reservationRoutes);
  router.use('/space-details', spaceDetailsRoutes);
}
