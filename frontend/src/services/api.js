
const API_URL = 'http://localhost:3000/api';

// Helper para manejar fetch con error handling
const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    }
    
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        const text = await response.text();
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
    
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(body);
    }
    
    return config;
};

export const apiService = {
    // ========== GUARDIAS ==========
    async getGuards(token) {
        try {
            console.log('🔵 [GET GUARDS] Iniciando petición...');
            
            const response = await fetch(`${API_URL}/guards`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            const result = await handleResponse(response);
            console.log('🔵 [GET GUARDS] Respuesta:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error en getGuards:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión', 
                data: [] 
            };
        }
    },

    async createGuard(guardData, token) {
        try {
            console.log('🔵 Creando guardia...');
            const response = await fetch(`${API_URL}/guards`, createFetchConfig('POST', guardData, token));
            return await handleResponse(response);
        } catch (error) {
            console.error('❌ Error en createGuard:', error);
            return { success: false, message: error.message || 'Error de conexión' };
        }
    },

    async toggleGuardAvailability(id, isAvailable, token) {
        try {
            console.log('🔵 Cambiando disponibilidad...');
            const response = await fetch(
                `${API_URL}/guards/${id}/availability`, 
                createFetchConfig('PATCH', { isAvailable }, token)
            );
            return await handleResponse(response);
        } catch (error) {
            console.error('❌ Error en toggleGuardAvailability:', error);
            return { success: false, message: error.message || 'Error de conexión' };
        }
    },

    // ========== BICICLETEROS ==========
    async getBikeracks(token) {
        console.log('🟢 [GET BIKERACKS] Iniciando petición...');
        console.log('🟢 URL:', `${API_URL}/bikeracks`);
        console.log('🟢 Token presente:', !!token);
        
        try {
            const response = await fetch(`${API_URL}/bikeracks`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log('🟢 Response status:', response.status);
            console.log('🟢 Response ok:', response.ok);
            console.log('🟢 Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (response.status === 401) {
                console.error('❌ ERROR 401: Token inválido');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                return { 
                    success: false, 
                    message: 'Sesión expirada',
                    data: [] 
                };
            }
            
            // Obtener el texto crudo primero
            const textData = await response.text();
            console.log('🟢 Texto crudo de respuesta:', textData);
            
            // Intentar parsearlo
            let result;
            try {
                result = JSON.parse(textData);
                console.log('🟢 JSON parseado:', result);
            } catch (parseError) {
                console.error('❌ Error parseando JSON:', parseError);
                return {
                    success: false,
                    message: 'Respuesta inválida del servidor',
                    data: []
                };
            }
            
            // Analizar estructura
            console.log('🟢 Tipo de resultado:', typeof result);
            console.log('🟢 Es array?:', Array.isArray(result));
            console.log('🟢 Keys:', Object.keys(result));
            console.log('🟢 result.success:', result.success);
            console.log('🟢 result.data:', result.data);
            console.log('🟢 Tipo de result.data:', typeof result.data);
            console.log('🟢 result.data es array?:', Array.isArray(result.data));
            
            // Si result.data existe, mostrar su contenido
            if (result.data) {
                console.log('🟢 Contenido de result.data:', result.data);
                console.log('🟢 Primer elemento:', result.data[0]);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Error crítico en getBikeracks:', error);
            console.error('❌ Stack:', error.stack);
            
            return {
                success: false,
                message: error.message || 'Error de conexión',
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
                
            console.log('🟡 [GET ASSIGNMENTS] Llamando:', endpoint);
            
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('🟡 Response status:', response.status);
            
            // Obtener texto crudo
            const textData = await response.text();
            console.log('🟡 Texto crudo:', textData);
            
            // Parsear
            let result;
            try {
                result = JSON.parse(textData);
                console.log('🟡 JSON parseado:', result);
            } catch (parseError) {
                console.error('❌ Error parseando assignments:', parseError);
                return { success: false, message: 'Error parseando respuesta', data: [] };
            }
            
            // Analizar estructura
            console.log('🟡 Estructura de assignments:');
            console.log('  - Tipo:', typeof result);
            console.log('  - Es array?:', Array.isArray(result));
            console.log('  - Keys:', Object.keys(result));
            console.log('  - result.success:', result.success);
            console.log('  - result.data:', result.data);
            console.log('  - Tipo result.data:', typeof result.data);
            console.log('  - result.data es array?:', Array.isArray(result.data));
            
            return result;
            
        } catch (error) {
            console.error('❌ Error en getGuardAssignments:', error);
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
            console.error('❌ Error checking availability:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión',
                data: { availableBikeracks: [] }
            };
        }
    },

    async deleteAssignment(assignmentId, token) {
        try {
            console.log('🔵 Eliminando asignación:', assignmentId);
            const response = await fetch(`${API_URL}/guard-assignments/${assignmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return await handleResponse(response);
            
        } catch (error) {
            console.error('❌ Error deleting assignment:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión' 
            };
        }
    },

    async createAssignment(assignmentData, token) {
        try {
            console.log('🔵 Creando asignación:', assignmentData);
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
            console.error('❌ Error en createAssignment:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión' 
            };
        }
    },

    async updateAssignment(assignmentId, assignmentData, token) {
        try {
            console.log('🔵 Actualizando asignación:', assignmentId, assignmentData);
            const response = await fetch(`${API_URL}/guard-assignments/${assignmentId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assignmentData)
            });
            
            return await handleResponse(response);
            
        } catch (error) {
            console.error('❌ Error en updateAssignment:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión' 
            };
        }
    },

    // ========== AUTH ==========
    async validateToken(token) {
        try {
            console.log('🔵 Validando token...');
            const response = await fetch(`${API_URL}/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return await handleResponse(response);
            
        } catch (error) {
            console.error('❌ Error validating token:', error);
            return { 
                success: false, 
                message: 'Token inválido o expirado' 
            };
        }
    }
};

export default apiService;