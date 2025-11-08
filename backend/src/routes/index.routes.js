import { Router } from "express";
import authRoutes from "./auth.routes.js";
import bicycleRoutes from "./bicycle.routes.js";


export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/bicycles", bicycleRoutes);
}
