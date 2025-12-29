// services/dashboard.service.js
'use strict';
import axios from './root.service.js';

/**
 * Servicio para el dashboard administrativo
 */
export const dashboardService = {
    /**
     * Obtiene todos los datos del dashboard
     * @returns {Promise<Object>} Datos completos del dashboard
     */
    async getDashboardData() {
        try {
            console.log(' [Service] Llamando a /dashboard/summary');
            console.log(' [Service] URL completa:', axios.defaults.baseURL + '/dashboard/summary');
            
            const response = await axios.get('/dashboard/summary');
            
            console.log(' [Service] Response status:', response.status);
            console.log(' [Service] Response data:', response.data);
            
            // Validar la estructura de respuesta
            if (!response.data) {
                throw new Error('Respuesta vacía del servidor');
            }

            const result = response.data;
            
            // Si el backend devuelve { status, message, data }
            if (result.status === 'Success' && result.data) {
                console.log(' [Service] Datos obtenidos correctamente');
                return result.data;
            }
            
            // Si el backend devuelve directamente el objeto de datos
            if (result.metrics || result.capacity) {
                console.log(' [Service] Datos obtenidos directamente');
                return result;
            }
            
            throw new Error(result.message || 'Formato de respuesta inesperado');
            
        } catch (error) {
            console.error(' [Service] Error completo:', error);
            console.error(' [Service] Error response:', error.response);
            console.error(' [Service] Error message:', error.message);
            
            // Mensajes de error más específicos
            if (error.response) {
                // El servidor respondió con un código de error
                const status = error.response.status;
                const message = error.response.data?.message || error.message;
                
                if (status === 401) {
                    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                } else if (status === 403) {
                    throw new Error('No tienes permisos para acceder al dashboard.');
                } else if (status === 404) {
                    throw new Error('Endpoint del dashboard no encontrado.');
                } else if (status >= 500) {
                    throw new Error('Error del servidor. Intenta nuevamente más tarde.');
                } else {
                    throw new Error(message);
                }
            } else if (error.request) {
                // La petición se hizo pero no hubo respuesta
                throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
            } else {
                // Error al configurar la petición
                throw new Error(error.message || 'Error desconocido al cargar el dashboard');
            }
        }
    },

    /**
     * Obtiene solo las métricas generales
     */
    async getMetrics() {
        try {
            const response = await axios.get('/dashboard/metrics');
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error obteniendo métricas:', error);
            throw new Error(
                error.response?.data?.message || 
                'Error al obtener métricas'
            );
        }
    },

    /**
     * Obtiene la capacidad de los bicicleteros
     */
    async getCapacidadBicicleteros() {
        try {
            const response = await axios.get('/dashboard/capacity');
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error obteniendo capacidad:', error);
            throw new Error(
                error.response?.data?.message || 
                'Error al obtener capacidad'
            );
        }
    },

    /**
     * Obtiene los guardias por zona
     */
    async getGuardiasPorZona() {
        try {
            const response = await axios.get('/dashboard/guards');
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error obteniendo guardias:', error);
            throw new Error(
                error.response?.data?.message || 
                'Error al obtener guardias'
            );
        }
    },

    /**
     * Obtiene la actividad reciente
     */
    async getActividadReciente() {
        try {
            const response = await axios.get('/dashboard/activity');
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error obteniendo actividad:', error);
            throw new Error(
                error.response?.data?.message || 
                'Error al obtener actividad'
            );
        }
    },

    /**
     * Obtiene los tipos de incidentes
     */
    async getTiposIncidentes() {
        try {
            const response = await axios.get('/dashboard/incidents');
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error obteniendo incidentes:', error);
            throw new Error(
                error.response?.data?.message || 
                'Error al obtener incidentes'
            );
        }
    }
};

export default dashboardService;