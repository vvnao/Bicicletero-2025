// utils/requestInfo.js
'use strict';

/**
 * Obtener IP del cliente
 */
export function getClientIp(req) {
    try {
        // Diferentes métodos para obtener la IP
        const ip = req.ip || 
                req.headers['x-forwarded-for']?.split(',')[0] || 
                req.connection?.remoteAddress || 
                req.socket?.remoteAddress || 
                req.connection?.socket?.remoteAddress ||
                '127.0.0.1';
        
        // Limpiar la IP (remover prefijos como ::ffff:)
        return ip.replace('::ffff:', '').replace('::1', '127.0.0.1');
    } catch (error) {
        console.error('Error obteniendo IP:', error);
        return '127.0.0.1';
    }
}

/**
 * Obtener User Agent
 */
export function getUserAgent(req) {
    try {
        return req.headers['user-agent'] || 'Desconocido';
    } catch (error) {
        console.error('Error obteniendo User Agent:', error);
        return 'Desconocido';
    }
}

/**
 * Extraer info del request para historial
 */
export function getRequestInfo(req) {
    try {
        return {
            ipAddress: getClientIp(req),
            userAgent: getUserAgent(req),
            userId: req.user?.id || null,
            userRole: req.user?.role || 'desconocido',
            timestamp: new Date()
        };
    } catch (error) {
        console.error('Error obteniendo info del request:', error);
        return {
            ipAddress: '127.0.0.1',
            userAgent: 'Desconocido',
            userId: null,
            userRole: 'error',
            timestamp: new Date()
        };
    }
}

/**
 * Obtener información del dispositivo (si está disponible)
 */
export function getDeviceInfo(req) {
    try {
        const userAgent = getUserAgent(req);
        
        // Detectar navegador
        let browser = 'Desconocido';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        else if (userAgent.includes('Opera')) browser = 'Opera';
        
        // Detectar SO
        let os = 'Desconocido';
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac')) os = 'Mac OS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS')) os = 'iOS';
        
        // Detectar dispositivo
        let device = 'Desktop';
        if (userAgent.includes('Mobile')) device = 'Mobile';
        else if (userAgent.includes('Tablet')) device = 'Tablet';
        
        return {
            browser,
            os,
            device,
            userAgent: userAgent.substring(0, 200) // Limitar longitud
        };
    } catch (error) {
        console.error('Error obteniendo info del dispositivo:', error);
        return {
            browser: 'Desconocido',
            os: 'Desconocido',
            device: 'Desconocido',
            userAgent: 'Error'
        };
    }
}

/**
 * Obtener información de la solicitud para logging
 */
export function getRequestLogInfo(req) {
    try {
        return {
            method: req.method,
            url: req.originalUrl || req.url,
            params: req.params,
            query: req.query,
            body: req.body ? JSON.stringify(req.body).substring(0, 500) : null, // Limitar longitud
            headers: {
                'content-type': req.headers['content-type'],
                'accept': req.headers['accept'],
                'authorization': req.headers['authorization'] ? 'Presente' : 'No presente'
            },
            ...getRequestInfo(req),
            deviceInfo: getDeviceInfo(req)
        };
    } catch (error) {
        console.error('Error obteniendo log info:', error);
        return {
            method: req?.method || 'UNKNOWN',
            url: req?.originalUrl || 'UNKNOWN',
            error: 'No se pudo obtener información'
        };
    }
}

export default {
    getClientIp,
    getUserAgent,
    getRequestInfo,
    getDeviceInfo,
    getRequestLogInfo
};