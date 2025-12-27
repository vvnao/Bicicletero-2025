// services/bikerack.service.js - Versión corregida
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Crear instancia de axios con configuración global
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true, // Para cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token JWT si existe
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 Token JWT agregado a la solicitud:', config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ Respuesta recibida:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('❌ Error en respuesta:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });

        // Manejar error 401 (no autorizado)
        if (error.response?.status === 401) {
            console.log('🔒 Sesión expirada - Redirigiendo a login');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
        }

        return Promise.reject(error);
    }
);

const bikerackService = {
    async getAll() {
        try {
            console.log('📡 [DEBUG] Llamando a GET /api/bikeracks');
            console.log('📡 [DEBUG] Token en localStorage:', localStorage.getItem('authToken'));
            
            const response = await apiClient.get('/bikeracks');
            
            console.log('✅ [DEBUG] Respuesta HTTP:', response.status);
            console.log('📊 [DEBUG] Respuesta completa:', response);
            
            // DEBUG: Verificar estructura
            console.log('🔍 [DEBUG] response.data:', response.data);
            console.log('🔍 [DEBUG] Tipo de response.data:', typeof response.data);
            
            if (Array.isArray(response.data)) {
                console.log('✅ response.data es array');
                return response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                console.log('✅ response.data.data es array');
                return response.data.data;
            } else {
                console.warn('⚠️ Estructura inesperada, devolviendo array vacío');
                return [];
            }
        } catch (error) {
            console.error('❌ [DEBUG] Error en getAll:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },
    
    async getById(id) {
        try {
            console.log(`📡 Solicitando bicicletero ${id}...`);
            const response = await apiClient.get(`/bikeracks/${id}`);
            
            if (response.data?.success && response.data.data) {
                return response.data.data;
            } else if (response.data?.data) {
                return response.data.data;
            }
            return response.data;
        } catch (error) {
            console.error('Error obteniendo bicicletero:', error);
            throw error;
        }
    }
};

export default bikerackService;