import axios from './root.service.js';
import cookies from 'js-cookie';

export async function createBicycle(formData) {
    try {
        const token = cookies.get("jwt-auth");
        const response = await axios.post("/bicycles", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data", 
            },
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { message: "Error al crear bicicleta" };
    }
}
export async function getBicycles() {
    try {
        const token = cookies.get('jwt-auth');
        const response = await axios.get('/bicycles', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener bicicletas' };
    }
}
export async function getAllBicycles(){
    try{
        const token = cookies.get('jwt-auth');
        const response = await axios.get('/bicycles/all',{
            headers: {authorization: `Bearer ${token}`}
        })
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener todos los usuarios' }
    }
}

export async function getBicyclesByUserId(id) {
    try {
        const token = cookies.get('jwt-auth');
        const response = await axios.get(`/bicycles/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { id: id }
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener bicicleta del usuario' };
    }
}

export async function deleteBicycles(id) {
    try {
        const token = cookies.get('jwt-auth');
        
        const response = await axios.delete('/bicycles', {
            headers: { 
                Authorization: `Bearer ${token}` 
            },
            data: { id } 
        });

        return { ok: true, data: response.data };

    } catch (error) {
        return { 
            ok: false, 
            error: error.response?.data?.message || 'Error al eliminar bicicleta' };
    }
}
export async function updateBicycles(id, formValues) { 
    try {
        const token = cookies.get('jwt-auth');

        const formData = new FormData();
        formData.append('color', formValues.color);

        if (formValues.photo) {
            formData.append('photo', formValues.photo);
        }

        const response = await axios.patch(`/bicycles/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Error al actualizar bicicleta" };
    }
}