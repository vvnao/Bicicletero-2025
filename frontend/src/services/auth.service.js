import axios from './root.service.js';
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
        return error.response?.data || { message: 'Error al iniciar sesión' };
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
        return error.response?.data || { message: 'Error al conectar con el servidor' };
    }
};

// LOGOUT
export const logout = () => {
    try {
        sessionStorage.removeItem('user');   
        cookies.remove('jwt-auth');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
};
