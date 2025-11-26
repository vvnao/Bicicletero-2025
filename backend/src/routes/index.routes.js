'use strict';
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import bikerackRoutes from "./bikerack.routes.js";
import bicycleRoutes from "./bicycle.routes.js";
import profileRoutes from "./profile.routes.js";
import reportRoutes from "../routes/report.routes.js";
import spaceManagementRoutes from './spaceManagement.routes.js';
import reservationRoutes from './reservation.routes.js';


export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/reports", reportRoutes);
  router.use("/auth", authRoutes);
  router.use("/bicycles", bicycleRoutes);
  router.use("/profile", profileRoutes );
  router.use("/bikeracks", bikerackRoutes);
  router.use("/spaces", bikerackRoutes);
  router.use('/spaces', spaceManagementRoutes); 
  router.use('/reservations', reservationRoutes);

}
