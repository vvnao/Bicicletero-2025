import axios from './root.service';  

export async function getBikeracks() {
  try {
    const { data } = await axios.get('/bikeracks/dashboard'); 
    return data.data;
  } catch (error) {
    console.error('Error al obtener bicicleteros:', error);
    throw error;
  }
}

export async function getBikerackDetail(id) {
  try {
    const { data } = await axios.get(`/bikeracks/${id}`); 
    return data.data;
  } catch (error) {
    console.error('Error al obtener detalle:', error);
    throw error;
  }
}

import axios from 'axios';
import Cookies from 'js-cookie'; // Añade esta importación

const API_BASE_URL = 'http://localhost:3000/api';

// Crear instancia de axios con configuración global
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token JWT si existe
apiClient.interceptors.request.use(
    (config) => {
        // Obtener token de COOKIES usando js-cookie
        const token = Cookies.get('jwt-auth');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Token JWT agregado a la solicitud:', config.url);
            console.log('🔐 Token (primeros 50 chars):', token.substring(0, 50) + '...');
        } else {
            console.log('⚠️ No se encontró token JWT en cookies');
            console.log('🍪 Todas las cookies:', document.cookie);
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
            status: response.status
        });
        return response;
    },
    (error) => {
        console.error('❌ Error en respuesta:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message
        });

        // Manejar error 401 (no autorizado)
        if (error.response?.status === 401) {
            console.log('🔒 Sesión expirada - Limpiando y redirigiendo');
            Cookies.remove('jwt-auth');
            sessionStorage.removeItem('usuario');
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
            console.log('📡 Llamando a GET /api/bikeracks');
            
            // Verificar cookies antes de hacer la petición
            console.log('🍪 Cookie jwt-auth presente:', Cookies.get('jwt-auth') ? '✅ Sí' : '❌ No');
            console.log('🍪 Todas las cookies:', document.cookie);
            
            const response = await apiClient.get('/bikeracks');
            
            console.log('📊 Status de respuesta:', response.status);
            
            // Extraer datos independientemente del formato
            let datos = response.data;
            
            // Si los datos vienen dentro de un objeto con propiedad 'data'
            if (datos && typeof datos === 'object' && datos.data && Array.isArray(datos.data)) {
                console.log('✅ Datos encontrados en response.data.data');
                return datos.data;
            }
            
            // Si es array directo
            if (Array.isArray(datos)) {
                console.log('✅ Datos son array directo');
                return datos;
            }
            
            // Si tiene otro formato, devolver como está
            console.log('⚠️ Formato inesperado, devolviendo response.data completo');
            return datos;
            
        } catch (error) {
            console.error('❌ Error en getAll:', error);
            
            // Si es error 401, ya el interceptor maneja la redirección
            if (error.response?.status === 401) {
                throw new Error('No autorizado. Redirigiendo a login...');
            }
            
            throw error;
        }
    },
    
    async getById(id) {
        try {
            console.log(`📡 Solicitando bicicletero ${id}...`);
            const response = await apiClient.get(`/bikeracks/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo bicicletero:', error);
            throw error;
        }
    }
};

export default bikerackService;