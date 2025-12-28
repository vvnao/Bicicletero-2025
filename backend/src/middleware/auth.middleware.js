// backend/src/middleware/auth.middleware.js
'use strict';

import jwt from 'jsonwebtoken';

// 1. MIDDLEWARE DE AUTENTICACIÓN BÁSICO
const authMiddleware = (req, res, next) => {
    try {
        console.log('🔍 Verificando autenticación...');
        
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No hay token en el header');
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. No se proporcionó token.'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('📨 Token recibido:', token.substring(0, 20) + '...');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
        
        req.user = decoded;
        console.log(`✅ Usuario autenticado: ${decoded.email || decoded.id} (rol: ${decoded.role})`);
        
        next();
    } catch (error) {
        console.error('❌ Error en autenticación:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token JWT inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Error de autenticación'
        });
    }
};

// 2. MIDDLEWARE PARA ADMINISTRADORES
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }
    
    if (req.user.role === 'admin') {
        console.log(`✅ Usuario es administrador: ${req.user.email || req.user.id}`);
        next();
    } else {
        console.log(`❌ Usuario NO es administrador. Rol: ${req.user.role}`);
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de administrador.'
        });
    }
};

// 3. MIDDLEWARE PARA ADMIN O GUARDIA
const isAdminOrGuard = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }
    
    if (req.user.role === 'admin' || req.user.role === 'guardia') {
        console.log(`✅ Usuario autorizado (admin/guardia): ${req.user.email || req.user.id}`);
        next();
    } else {
        console.log(`❌ Usuario NO autorizado. Rol: ${req.user.role}`);
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de administrador o guardia.'
        });
    }
};

// 4. MIDDLEWARE PARA GUARDIAS
const isGuard = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }
    
    if (req.user.role === 'guardia') {
        console.log(`✅ Usuario es guardia: ${req.user.email || req.user.id}`);
        next();
    } else {
        console.log(`❌ Usuario NO es guardia. Rol: ${req.user.role}`);
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de guardia.'
        });
    }
};

// 5. MIDDLEWARE PARA USUARIOS REGULARES
const isUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }
    
    if (req.user.role === 'usuario') {
        console.log(`✅ Usuario regular: ${req.user.email || req.user.id}`);
        next();
    } else {
        console.log(`❌ No es usuario regular. Rol: ${req.user.role}`);
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de usuario.'
        });
    }
};

// 6. MIDDLEWARE isOwnerOrAdmin - PARA QUE EL USUARIO ACCEDA A SU PROPIO PERFIL O SEA ADMIN
const isOwnerOrAdmin = (idParam = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }
        
        const requestedId = req.params[idParam];
        const userId = req.user.id;
        
        console.log(`🔍 Verificando permisos: UserID=${userId}, RequestedID=${requestedId}, Role=${req.user.role}`);
        
        // Si es admin, permite siempre
        if (req.user.role === 'admin') {
            console.log('✅ Admin puede acceder a cualquier recurso');
            return next();
        }
        
        // Si es el dueño del recurso
        if (userId === requestedId) {
            console.log('✅ Usuario accediendo a su propio recurso');
            return next();
        }
        
        console.log(`❌ Acceso denegado. UserID (${userId}) no coincide con RequestedID (${requestedId})`);
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Solo puedes acceder a tus propios recursos.'
        });
    };
};

// 7. MIDDLEWARE PARA CUALQUIER USUARIO AUTENTICADO
const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }
    next();
};

// 🔽 EXPORTACIONES - TODAS LAS FUNCIONES QUE NECESITAS 🔽
export {
    authMiddleware,
    isAdmin,
    isAdminOrGuard,
    isGuard,
    isUser,
    isOwnerOrAdmin,
    isAuthenticated
};

// Exportación por defecto también por si acaso
export default {
    authMiddleware,
    isAdmin,
    isAdminOrGuard,
    isGuard,
    isUser,
    isOwnerOrAdmin,
    isAuthenticated
};