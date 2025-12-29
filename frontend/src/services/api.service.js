// frontend/src/services/api.service.js - VERSIÓN CORREGIDA
const API_URL = 'http://localhost:3000/api';

// Helper para manejar fetch con error handling
const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
        // Si es error HTTP, intentar obtener mensaje del backend
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    }
    
    // ... resto de tu lógica de !response.ok ...

    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        const text = await response.text();
        if (!text) return { success: false, message: "Respuesta vacía del servidor" }; // Evita objetos vacíos
        try {
            return JSON.parse(text);
        } catch {
            return { success: true, data: text || {} };
        }
    }
};

// Configuración base para fetch
const createFetchConfig = (method = 'GET', body = null, token = null) => {
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    // Agregar token si existe
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Agregar body si existe
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(body);
    }
    
    return config;
};

export const apiService = {
    // ========== GUARDIAS ==========
    async getGuards(token) {
        try {
            console.log(' [GET GUARDS] Iniciando petición...');
            console.log(' Token recibido:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
            
            const response = await fetch(`${API_URL}/guards`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            
            const result = await handleResponse(response);
            console.log(' getGuards response:', result);
            return result;
            
        } catch (error) {
            console.error(' Error en getGuards:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión', 
                data: [] 
            };
        }
    },

    async createGuard(guardData, token) {
        try {
            console.log(' Creando guardia...');
            const response = await fetch(`${API_URL}/guards`, createFetchConfig('POST', guardData, token));
            return await handleResponse(response);
        } catch (error) {
            console.error('Error en createGuard:', error);
            return { success: false, message: error.message || 'Error de conexión' };
        }
    },

    async toggleGuardAvailability(id, isAvailable, token) {
        try {
            console.log('Cambiando disponibilidad...');
            const response = await fetch(
                `${API_URL}/guards/${id}/availability`, 
                createFetchConfig('PATCH', { isAvailable }, token)
            );
            return await handleResponse(response);
        } catch (error) {
            console.error('Error en toggleGuardAvailability:', error);
            return { success: false, message: error.message || 'Error de conexión' };
        }
    },

    // ========== BICICLETEROS ==========
    async getBikeracks(token) {
        console.log(' Llamando a GET /api/bikeracks');
        console.log(' Token usado:', token ? 'PRESENTE' : 'AUSENTE');
        
        try {
            const response = await fetch(`${API_URL}/bikeracks`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log('- Response status:', response.status);
            console.log('- Response ok:', response.ok);
            
            if (response.status === 401) {
                console.error('❌ ERROR 401: Token inválido o expirado');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                return { 
                    success: false, 
                    message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
                    data: [] 
                };
            }
            
            const result = await handleResponse(response);
            console.log(' Datos crudos de bikeracks:', result);
            
            // Verificar estructura de respuesta
            if (result && result.success !== undefined) {
                if (result.success && Array.isArray(result.data)) {
                    console.log(` ${result.data.length} bicicleteros recibidos`);
                    return result;
                } else {
                    console.warn(' Backend retornó success:false:', result.message);
                    return result;
                }
            } else {
                console.warn('⚠️Estructura inesperada de respuesta:', result);
                return { 
                    success: false, 
                    message: 'Formato de respuesta inválido del servidor',
                    data: [] 
                };
            }
            
        } catch (error) {
            console.error(' Error crítico en getBikeracks:', error);
            
            // Si es error de autenticación, limpiar localStorage
            if (error.message.includes('401') || error.message.includes('token')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                return { 
                    success: false, 
                    message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
                    data: [] 
                };
            }
            
            return {
                success: false,
                message: error.message || 'Error de conexión con el servidor',
                data: []
            };
        }
    },

    // ========== ASIGNACIONES ==========
    async getGuardAssignments(token, guardId = null) {
        try {
            const endpoint = guardId 
                ? `/guard-assignments/guard/${guardId}`
                : '/guard-assignments';
                
            console.log(` Llamando: ${endpoint}`);
            
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await handleResponse(response);
            console.log(' Respuesta de asignaciones:', result);
            
            return result;
            
        } catch (error) {
            console.error(' Error en getGuardAssignments:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión', 
                data: [] 
            };
        }
    },

    async checkAvailability(params, token) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(
                `${API_URL}/guard-assignments/check-availability?${queryString}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return await handleResponse(response);
        } catch (error) {
            console.error('Error checking availability:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión',
                data: { availableBikeracks: [] }
            };
        }
    },

    async deleteAssignment(assignmentId, token) {
        try {
            console.log(` Eliminando: ${assignmentId}`);
            const response = await fetch(`${API_URL}/guard-assignments/${assignmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return await handleResponse(response);
            
        } catch (error) {
            console.error('Error deleting assignment:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión' 
            };
        }
    },

    async createAssignment(assignmentData, token) {
        try {
            console.log('  Creando asignación...');
            const response = await fetch(`${API_URL}/guard-assignments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assignmentData)
            });
            
            return await handleResponse(response);
            
        } catch (error) {
            console.error('Error en createAssignment:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión' 
            };
        }
    },

    // ========== AUTH ==========
    async validateToken(token) {
        try {
            console.log(' Validando token...');
            const response = await fetch(`${API_URL}/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return await handleResponse(response);
            
        } catch (error) {
            console.error('Error validating token:', error);
            return { 
                success: false, 
                message: 'Token inválido o expirado' 
            };
        }
    }
};

export default apiService;