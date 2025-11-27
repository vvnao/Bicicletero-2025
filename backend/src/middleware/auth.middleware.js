import jwt from "jsonwebtoken";
import { handleErrorClient } from "../Handlers/responseHandlers.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return handleErrorClient(res, 401, "Acceso denegado. No se proporcionó token.");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return handleErrorClient(res, 401, "Acceso denegado. Token malformado.");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return handleErrorClient(res, 401, "Token inválido o expirado.", error.message);
  }
}

// Middleware para verificar si el usuario es guardia
export function isGuard(req, res, next) {
  if (req.user.role !== "guardia") {
    return handleErrorClient(res, 403, "Solo los guardias pueden realizar esta acción.");
  }
  next();
}

// Middleware para verificar si el usuario es administrador
export function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return handleErrorClient(res, 403, "Solo los administradores pueden realizar esta acción.");
  }
  next();
}