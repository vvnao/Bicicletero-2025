import { Router } from "express";
import { UserReview } from "../controllers/userReview.controller.js";
import { authMiddleware, isGuard, isAdmin } from "../middleware/auth.middleware.js";

export const router = Router();

// Guardias — pueden aprobar / rechazar / ver pendientes
router.get("/pending", authMiddleware, isGuard, UserReview.pending);
router.post("/approve/:id", authMiddleware, isGuard, UserReview.approve);
router.post("/reject/:id", authMiddleware, isGuard, UserReview.reject);

// Admin y guardia — pueden ver historial completo
router.get("/history", authMiddleware, (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "guardia") return next();
    return res.status(403).json({ message: "No autorizado" });
}, UserReview.history);

router.get("/history/filter", authMiddleware, (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "guardia") return next();
    return res.status(403).json({ message: "No autorizado" });
}, UserReview.filterByStatus);

router.delete("/history/:id", authMiddleware, isGuard, UserReview.delete);

router.put("/history/:id/status", authMiddleware, isGuard, UserReview.updateStatus);
export default router;