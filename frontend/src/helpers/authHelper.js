// frontend/src/utils/authHelper.js
import Cookies from 'js-cookie';

/**
 * Obtiene el token de autenticación de todas las fuentes posibles
 * @returns {string|null} El token JWT o null si no existe
 */
export const getAuthToken = () => {
    console.group('🔍 Buscando token de autenticación...');
    
    // 1. Cookies (js-cookie)
    const cookieToken = Cookies.get('jwt-auth');
    console.log('🍪 Cookie (jwt-auth):', cookieToken ? '✅ Presente' : '❌ Ausente');
    
    // 2. localStorage
    const localStorageToken = localStorage.getItem('token') || 
                             localStorage.getItem('authToken') || 
                             localStorage.getItem('jwt-auth');
    console.log('📦 localStorage:', localStorageToken ? '✅ Presente' : '❌ Ausente');
    
    // 3. sessionStorage
    const sessionStorageToken = sessionStorage.getItem('token') || 
                               sessionStorage.getItem('authToken') || 
                               sessionStorage.getItem('jwt-auth') ||
                               sessionStorage.getItem('usuario_token');
    console.log('💾 sessionStorage:', sessionStorageToken ? '✅ Presente' : '❌ Ausente');
    
    const token = cookieToken || localStorageToken || sessionStorageToken;
    
    // Validar token
    if (!token || token === 'undefined' || token === 'null' || token === '') {
        console.log('🎯 Resultado: ❌ NO hay token válido');
        console.groupEnd();
        return null;
    }
    
    console.log('🎯 Resultado: ✅ Token válido encontrado');
    console.log('📏 Longitud del token:', token.length, 'caracteres');
    console.log('🔤 Primeros 20 caracteres:', token.substring(0, 20) + '...');
    console.groupEnd();
    
    return token;
};

/**
 * Obtiene los datos del usuario autenticado
 * @returns {object|null} Datos del usuario o null
 */
export const getUserData = () => {
    try {
        console.group('👤 Buscando datos de usuario...');
        
        // 1. sessionStorage (formato principal según auth.service.js)
        const sessionUser = sessionStorage.getItem('usuario');
        if (sessionUser) {
            console.log('💾 Usuario en sessionStorage (usuario): ✅');
            const parsed = JSON.parse(sessionUser);
            console.log('📋 Datos:', { id: parsed.id, email: parsed.email, role: parsed.role });
            console.groupEnd();
            return parsed;
        }
        
        // 2. localStorage
        const localUser = localStorage.getItem('user');
        if (localUser) {
            console.log('📦 Usuario en localStorage (user): ✅');
            const parsed = JSON.parse(localUser);
            console.log('📋 Datos:', { id: parsed.id, email: parsed.email, role: parsed.role });
            console.groupEnd();
            return parsed;
        }
        
        console.log('👤 Resultado: ❌ No hay datos de usuario');
        console.groupEnd();
        return null;
        
    } catch (error) {
        console.error('❌ Error parseando datos de usuario:', error);
        console.groupEnd();
        return null;
    }
};

/**
 * Verifica si el usuario tiene rol de admin o guardia
 * @returns {boolean}
 */
export const isAdminOrGuard = () => {
    const user = getUserData();
    if (!user) {
        console.log('🔒 isAdminOrGuard: ❌ No hay usuario');
        return false;
    }
    
    const result = user.role === 'admin' || user.role === 'guardia';
    console.log(`🔒 isAdminOrGuard (${user.role}):`, result ? '✅ Sí' : '❌ No');
    return result;
};

/**
 * Verifica si el usuario tiene rol de admin
 * @returns {boolean}
 */
export const isAdmin = () => {
    const user = getUserData();
    if (!user) {
        console.log('👑 isAdmin: ❌ No hay usuario');
        return false;
    }
    
    const result = user.role === 'admin';
    console.log(`👑 isAdmin (${user.role}):`, result ? '✅ Sí' : '❌ No');
    return result;
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    const token = getAuthToken();
    const user = getUserData();
    const result = !!(token && user);
    
    console.log('🔐 isAuthenticated:', result ? '✅ Sí' : '❌ No', {
        hasToken: !!token,
        hasUser: !!user
    });
    
    return result;
};

/**
 * Cierra sesión de forma segura
 */
export const logout = () => {
    console.warn('🚪 Cerrando sesión...');
    
    // Limpiar cookies
    Cookies.remove('jwt-auth');
    
    // Limpiar sessionStorage
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('usuario_token');
    
    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('jwt-auth');
    
    console.log('🧹 Sesión limpiada, redirigiendo a login...');
    
    // Redirigir al login
    setTimeout(() => {
        window.location.href = '/auth/login';
    }, 100);
};

/**
 * Función auxiliar para debuggear la autenticación
 */
export const debugAuth = () => {
    console.group('🐛 DEBUG - Estado de Autenticación');
    console.log('🔐 Token:', getAuthToken() ? '✅ Presente' : '❌ Ausente');
    console.log('👤 Usuario:', getUserData());
    console.log('🎯 Autenticado:', isAuthenticated() ? '✅ Sí' : '❌ No');
    console.log('👑 Es admin?:', isAdmin() ? '✅ Sí' : '❌ No');
    console.log('🔒 Es admin o guardia?:', isAdminOrGuard() ? '✅ Sí' : '❌ No');
    console.log('🍪 Cookies completas:', document.cookie);
    console.log('💾 sessionStorage:', Object.keys(sessionStorage));
    console.log('📦 localStorage:', Object.keys(localStorage));
    console.groupEnd();
};

// Exportar todas las funciones
export default {
    getAuthToken,
    getUserData,
    isAdminOrGuard,
    isAdmin,
    isAuthenticated,
    logout,
    debugAuth
};