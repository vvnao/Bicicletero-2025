import axios from './root.service.js';
import cookies from 'js-cookie';

export async function createReservation(bikerackId, bicycleId, estimatedHours) {
    try {
        const token = cookies.get('jwt-auth');

        const response = await axios.post('/reservations/create', {
            bikerackId,
            bicycleId,
            estimatedHours
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al procesar la reserva' };
    }
}
export async function cancelReservation(reservationId) {
    try {
        const { data } = await axios.patch(`/reservations/${reservationId}/cancel`);
        return data; 
    } catch (error) {
        throw error.response?.data || { message: 'Error al cancelar la reserva' };
    }
}
export async function getAllBikeracks() {
    try {
        const response = await axios.get('/bikeracks/all');

        return response.data; 
    } catch (error) {
        console.error('Error al obtener bicicleteros:', error);
        return error.response?.data || { message: 'Error al obtener bicicleteros' };
    }
}
export async function getAvailableSpaces() {
    try {
        const response = await axios.get('/reservations'); 
        return response.data; 
    } catch (error) {
        console.error('Error al obtener espacios disponibles:', error);
        return error.response?.data || { message: 'Error al obtener los espacios disponibles' };
    }
}