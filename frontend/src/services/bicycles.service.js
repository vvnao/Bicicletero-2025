import axios from './root.service.js';

export async function createBicycle(formValues) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post('/bicycles', formValues, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al crear bicicleta' };
    }
}
export async function getBicycles() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/bicycles', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener bicicletas' };
    }
}
export async function getAllBicycles() {
    try {
        const token = localStorage.setItem('token');
        const response = await axios.get('/bicycles/all', {
            headers: { authorization: `Bearer ${token}` }
        })
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener todos los usuarios' }
    }
}

export async function getBicyclesByUserId(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/bicycles/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener bicicleta del usuario' };
    }
}

