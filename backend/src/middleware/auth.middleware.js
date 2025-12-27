import jwt from 'jsonwebtoken';
import { handleErrorClient } from '../Handlers/responseHandlers.js';

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
        
        // Normalizar la estructura del usuario
        req.user = {
        // Intentar obtener el ID de diferentes maneras
        id: payload.id || payload.userId || payload.sub || payload.user?.id,
        
        // Intentar obtener el rol
        role: payload.role || payload.user?.role,
        
        // Intentar obtener el email
        email: payload.email || payload.user?.email,
        
        // Mantener el payload completo por si acaso
        _raw: payload
        };
        
        console.log(' Usuario normalizado:', {
        id: req.user.id,
        role: req.user.role,
        email: req.user.email
        });
        
        // Verificar que al menos tengamos un ID
        if (!req.user.id) {
        console.error(' JWT no contiene ID:', payload);
        return handleErrorClient(res, 401, "Token no contiene información de usuario válida.");
        }
        
        next();
    } catch (error) {
        console.error('X Error verificando token:', error.message);
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
    userRole: req.user?.role,
  };
}

/**
 * Middleware: Check if user is an Admin
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin role required.',
  });
};

/**
 * Middleware: Check if user is a Guard
 */
export const isGuard = (req, res, next) => {
  // Adjust the role name if your system uses a different term (e.g., 'guardia', 'guard')
  if (req.user && req.user.role === 'guardia') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Guard role required.',
  });
};

/**
 * Middleware: Check if user is Admin OR Guard
 */
export const isAdminOrGuard = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'guardia')) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin or Guard role required.',
  });
};
// middleware/ownerOrAdmin.middleware.js - NUEVO ARCHIVO
export const isOwnerOrAdmin = (paramName = 'id') => {
    return (req, res, next) => {
        try {
            const resourceId = parseInt(req.params[paramName]);
            const userId = req.user.id;
            const userRole = req.user.role;

            // Si es admin o el propietario del recurso
            if (userRole === 'admin' || userId === resourceId) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: "No tienes permisos para acceder a este recurso"
            });

        } catch (error) {
            console.error('Error en middleware isOwnerOrAdmin:', error);
            return res.status(500).json({
                success: false,
                message: "Error de permisos"
            });
        }
    };
};
