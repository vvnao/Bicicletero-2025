import axios from './root.service.js';

export async function reservation(){
    try{
        const token = localStorage.getItem('token');
        const response = await axios.post('/reservations', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    } catch(error) {
        return error.response?.data || { message: 'Error al obtener las reservas'};
    }
}