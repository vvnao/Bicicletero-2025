import axios from './root.service.js';

export async function getProfile() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/profile/private', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener perfil' };
    }
}

export async function updatePrivateProfile(formValues){
    try{
        const token = localStorage.getItem('token');
        const response = await axios.patch('/profile/private',formValues,{
            headers: {Authorization: `Bearer ${token}` }
        });
        return response.data
    }catch(error){
        return error.response?.data || { message: 'Error al actualizar perfil' };
    }
}

export async function deletePrivateProfile(){
    try{
        const token = localStorage.getItem('token');
        const response = await axios.delete('profile/private',{
            headers: {Authorization: `Bearer ${token}`}
        });
        return response.data;
    }catch(error){
        error.response?.data || { message: 'Error al eliminar perfil' };
    }
}