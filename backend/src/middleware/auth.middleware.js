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

/**
 * Obtener User Agent
 */
export function getUserAgent(req) {
    return req.headers['user-agent'] || 'Desconocido';
}

/**
 * Extraer info del request para historial
 */
export function getRequestInfo(req) {
    return {
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
        userId: req.user?.id,
        userRole: req.user?.role
    };
}
export const isOwnerOrAdmin = (idParam = 'id') => {
    return (req, res, next) => {
        try {
            console.log(`🔑 Verificando propiedad/admin. Parámetro: ${idParam}`);
            console.log(`🔑 ID solicitado: ${req.params[idParam]}, Usuario ID: ${req.user?.id}`);
            
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado'
                });
            }

            const resourceId = parseInt(req.params[idParam]);
            const userId = req.user.id;

            // Si es admin, permitir siempre
            if (req.user.role === 'admin') {
                console.log('✅ Usuario es admin - acceso permitido');
                return next();
            }

            // Si es el propietario del recurso
            if (resourceId === userId) {
                console.log('✅ Usuario es propietario del recurso - acceso permitido');
                return next();
            }

            console.log(`❌ Acceso denegado: No es admin ni propietario`);
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para acceder a este recurso'
            });
        } catch (error) {
            console.error('❌ Error en isOwnerOrAdmin:', error);
            return res.status(500).json({
                success: false,
                message: 'Error de autorización'
            });
        }
    };
};