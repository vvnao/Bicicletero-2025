'use strict';
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import bikerackRoutes from "./bikerack.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/bikeracks", bikerackRoutes);
  router.use("/spaces", bikerackRoutes);
}
