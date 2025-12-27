import axios from './root.service';
import cookies from 'js-cookie';

// LOGIN
export const login = async (credentials) => {
    try {
        const { email, password } = credentials;
        const response = await axios.post('/auth/login', {
            email,
            password
        });

        const { token, user } = response.data.data;
        cookies.set('jwt-auth', token, { path: '/' });
        sessionStorage.setItem('usuario', JSON.stringify(user));

        return response.data;
    } catch (error) {
        console.error('Error en login:', error);
        throw error.response?.data || error; 
    }
};

// REGISTER
export const register = async (formData) => {
    try {
        const response = await axios.post('/auth/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Error en register:', error);
        throw error.response?.data || error;
    }
};

// LOGOUT
export const logout = () => {
    try {
        sessionStorage.removeItem('user');
        cookies.remove('jwt-auth');
        window.location.href = '/login';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
};

// Obtener token de cookies
export const getToken = () => {
    return cookies.get('jwt-auth');
};

// Verificar autenticación
export const isAuthenticated = () => {
    return !!getToken();
};

// Obtener datos del usuario
export const getUserData = () => {
    try {
        const user = sessionStorage.getItem('usuario');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};