// backend/middleware/auth.middleware.js - VERSIÓN DEBUG
import jwt from "jsonwebtoken";
import { handleErrorClient } from "../Handlers/responseHandlers.js";

export function authMiddleware(req, res, next) {
  console.log('🔐 ========== AUTH MIDDLEWARE START ==========');
  console.log('🔐 URL:', req.url);
  console.log('🔐 Method:', req.method);
  
  const authHeader = req.headers["authorization"];
  console.log('🔐 Authorization header:', authHeader);

  if (!authHeader) {
    console.error('❌ No Authorization header');
    return handleErrorClient(res, 401, "Acceso denegado. No se proporcionó token.");
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    console.error('❌ No token after Bearer');
    return handleErrorClient(res, 401, "Acceso denegado. Token malformado.");
  }

  console.log('🔐 Token received (first 50 chars):', token.substring(0, 50) + '...');
  
  // Verificar si es un JWT válido
  const parts = token.split('.');
  console.log('🔐 Token parts:', parts.length);
  
  if (parts.length !== 3) {
    console.error('❌ Invalid JWT format - not 3 parts');
    return handleErrorClient(res, 401, "Token JWT inválido.");
  }

  try {
    // Decodificar sin verificar primero para ver el payload
    const decodedWithoutVerify = jwt.decode(token);
    console.log('🔐 Decoded token (without verify):', decodedWithoutVerify);
    
    // Verificar la firma
    console.log('🔐 Verifying with JWT_SECRET...');
    console.log('🔐 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔐 JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully');
    console.log('📋 Token payload:', payload);
    
    // Normalizar la estructura del usuario
    req.user = {
      id: payload.id || payload.userId || payload.sub,
      role: payload.role,
      email: payload.email,
      _raw: payload
    };
    
    console.log('👤 Normalized user:', req.user);
    
    if (!req.user.id) {
      console.error('❌ No ID in token payload');
      return handleErrorClient(res, 401, "Token no contiene información de usuario válida.");
    }
    
    console.log('🔐 ========== AUTH MIDDLEWARE END ==========');
    next();
  } catch (error) {
    console.error('❌ JWT Verification Error:', {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt
    });
    
    if (error.name === 'TokenExpiredError') {
      return handleErrorClient(res, 401, "Token expirado. Por favor, inicia sesión nuevamente.");
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.error('❌ Possible JWT_SECRET mismatch or token tampered');
      console.error('❌ Make sure JWT_SECRET in .env matches the one used to sign the token');
      return handleErrorClient(res, 401, "Token inválido: firma incorrecta.");
    }
    
    return handleErrorClient(res, 401, "Error al verificar token.", error.message);
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

/**
 * Middleware: Check if user is an Admin
 */
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required."
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
        message: "Access denied. Guard role required."
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
        message: "Access denied. Admin or Guard role required."
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