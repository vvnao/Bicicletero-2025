// frontend/src/utils/authHelper.js
import Cookies from 'js-cookie';

export const getAuthToken = () => {
  // 1. Buscar en cookies (jwt-auth)
  const cookieToken = Cookies.get('jwt-auth');
  
  // 2. Buscar en localStorage (compatibilidad)
  const localStorageToken = localStorage.getItem('authToken');
  
  console.log('🔍 Buscando token...');
  console.log('🍪 Cookies (jwt-auth):', cookieToken ? '✅ Presente' : '❌ Ausente');
  console.log('📦 localStorage (authToken):', localStorageToken ? '✅ Presente' : '❌ Ausente');
  
  // Prioridad: cookies > localStorage
  return cookieToken || localStorageToken;
};

export const getUserData = () => {
  try {
    // 1. Buscar en sessionStorage (usuario)
    const sessionUser = sessionStorage.getItem('usuario');
    if (sessionUser) return JSON.parse(sessionUser);
    
    // 2. Buscar en localStorage (user)
    const localUser = localStorage.getItem('user');
    if (localUser) return JSON.parse(localUser);
    
    return null;
  } catch (error) {
    console.error('Error parseando usuario:', error);
    return null;
  }
};

export const isAdminOrGuard = () => {
  const user = getUserData();
  if (!user) return false;
  return user.role === 'admin' || user.role === 'guardia';
};

export const logout = () => {
  Cookies.remove('jwt-auth');
  sessionStorage.removeItem('usuario');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/auth/login';
};