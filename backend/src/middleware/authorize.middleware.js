
'use strict';

export const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado'
                });
            }

            if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para esta acción'
                });
            }

            next();
        } catch (error) {
            console.error('Error en authorize middleware:', error);
            return res.status(500).json({
                success: false,
                message: 'Error de autorización'
            });
        }
    };
};