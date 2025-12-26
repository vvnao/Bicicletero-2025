import axios from './root.service.js';
import cookies from 'js-cookie';

export async function getPrivateProfile() {
    try {
        const token = cookies.get('jwt-auth');
        const response = await axios.get('/profile', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener perfil' };
    }
}
export async function getProfiles() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/profile/all', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener perfil' };
    }
}
export async function updatePrivateProfile(formValues){
    try{
        const token = cookies.get('jwt-auth');
        const response = await axios.put('/profile',formValues,{
            headers: {Authorization: `Bearer ${token}` }
        });
        return response.data
    }catch(error){
        return error.response?.data || { message: 'Error al actualizar perfil' };
    }
}