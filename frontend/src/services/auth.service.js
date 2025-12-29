import axios from './root.service';
import cookies from 'js-cookie';

/* ======================
   LOGIN
====================== */
export const login = async ({ email, password }) => {
  try {
    const response = await axios.post('/auth/login', { email, password });

    const { token, user } = response.data.data;


    cookies.set('jwt-auth', token, { path: '/' });
    sessionStorage.setItem('usuario', JSON.stringify(user));

    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error.response?.data || error;
  }
};

/* ======================
   REGISTER
====================== */
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

/* ======================
   LOGOUT
====================== */
export const logout = () => {
  cookies.remove('jwt-auth');
  sessionStorage.removeItem('usuario');
  window.location.href = '/auth/login';
};

/* ======================
   HELPERS
====================== */
export const getToken = () => cookies.get('jwt-auth');

export const isAuthenticated = () => !!getToken();

export const getUserData = () => {
  try {
    return JSON.parse(sessionStorage.getItem('usuario'));
  } catch {
    return null;
  }
};
