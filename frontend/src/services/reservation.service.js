import axios from './root.service.js';
import cookies from 'js-cookie';

export async function reservation(){
    try{
        const token = cookies.get('jwt-auth');
        const response = await axios.post('/reservations', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    } catch(error) {
        return error.response?.data || { message: 'Error al obtener las reservas'};
    }
}