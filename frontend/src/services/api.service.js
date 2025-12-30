// api.service.js - COMPLETO CON AXIOS (igual formato que history.service.js)
import axios from './root.service.js';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiService = {
    // ========== GUARDIAS ==========
    async getGuards(token) {
        try {
            console.log('🔵 [GET GUARDS] Iniciando petición...');
            console.log('🔑 Token recibido:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
            
            const response = await axios.get('/guards');
            console.log('✅ getGuards response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error en getGuards:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión', 
                data: [] 
            };
        }
    },

    async createGuard(guardData, token) {
        try {
            console.log('🔵 Creando guardia...');
            const response = await axios.post('/guards', guardData);
            return response.data;
        } catch (error) {
            console.error('❌ Error en createGuard:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    async toggleGuardAvailability(id, isAvailable, token) {
        try {
            console.log('🔵 Cambiando disponibilidad...');
            const response = await axios.patch(`/guards/${id}/availability`, { isAvailable });
            return response.data;
        } catch (error) {
            console.error('❌ Error en toggleGuardAvailability:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    // ========== BICICLETEROS ==========
    async getBikeracks(token) {
        console.log('🔵 Llamando a GET /api/bikeracks');
        console.log('🔑 Token usado:', token ? 'PRESENTE' : 'AUSENTE');
        
        try {
            const response = await axios.get('/bikeracks');
            
            console.log('📊 Response status:', response.status);
            console.log('📊 Response ok:', response.status === 200);
            console.log('📦 Datos crudos de bikeracks:', response.data);
            
            const result = response.data;
            
            // Verificar estructura de respuesta
            if (result && result.success !== undefined) {
                if (result.success && Array.isArray(result.data)) {
                    console.log(`✅ ${result.data.length} bicicleteros recibidos`);
                    return result;
                } else {
                    console.warn('⚠️ Backend retornó success:false:', result.message);
                    return result;
                }
            } else {
                console.warn('⚠️ Estructura inesperada de respuesta:', result);
                return { 
                    success: false, 
                    message: 'Formato de respuesta inválido del servidor',
                    data: [] 
                };
            }
            
        } catch (error) {
            console.error('❌ Error crítico en getBikeracks:', error);
            
            // Si es error 401, limpiar localStorage
            if (error.response?.status === 401) {
                console.error('❌ ERROR 401: Token inválido o expirado');
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
                message: error.response?.data?.message || error.message || 'Error de conexión con el servidor',
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
                
            console.log(`🔵 Llamando: ${endpoint}`);
            
            const response = await axios.get(endpoint);
            
            console.log('✅ Respuesta de asignaciones:', response.data);
            return response.data;
            
        } catch (error) {
            console.error('❌ Error en getGuardAssignments:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión', 
                data: [] 
            };
        }
    },

    async checkAvailability(params, token) {
        try {
            const response = await axios.get('/guard-assignments/check-availability', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Error checking availability:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión',
                data: { availableBikeracks: [] }
            };
        }
    },

    async deleteAssignment(assignmentId, token) {
        try {
            console.log(`🔵 Eliminando: ${assignmentId}`);
            const response = await axios.delete(`/guard-assignments/${assignmentId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error deleting assignment:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    async createAssignment(assignmentData, token) {
        try {
            console.log('🔵 Creando asignación...');
            const response = await axios.post('/guard-assignments', assignmentData);
            return response.data;
        } catch (error) {
            console.error('❌ Error en createAssignment:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    async updateAssignment(assignmentId, assignmentData, token) {
        try {
            console.log(`🔵 Actualizando asignación: ${assignmentId}`);
            const response = await axios.put(`/guard-assignments/${assignmentId}`, assignmentData);
            return response.data;
        } catch (error) {
            console.error('❌ Error en updateAssignment:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    // ========== AUTH ==========
    async validateToken(token) {
        try {
            console.log('🔵 Validando token...');
            const response = await axios.get('/auth/validate');
            return response.data;
        } catch (error) {
            console.error('❌ Error validating token:', error);
            return { 
                success: false, 
                message: 'Token inválido o expirado' 
            };
        }
    },

    async login(credentials) {
        try {
            console.log('🔵 Iniciando sesión...');
            const response = await axios.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            console.error('❌ Error en login:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    async logout(token) {
        try {
            console.log('🔵 Cerrando sesión...');
            const response = await axios.post('/auth/logout');
            return response.data;
        } catch (error) {
            console.error('❌ Error en logout:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    async register(userData) {
        try {
            console.log('🔵 Registrando usuario...');
            const response = await axios.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('❌ Error en register:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    // ========== USUARIOS ==========
    async getUsers(token) {
        try {
            console.log('🔵 Obteniendo usuarios...');
            const response = await axios.get('/users');
            return response.data;
        } catch (error) {
            console.error('❌ Error en getUsers:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión',
                data: [] 
            };
        }
    },

    async getUserById(userId, token) {
        try {
            console.log(`🔵 Obteniendo usuario: ${userId}`);
            const response = await axios.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error en getUserById:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    async updateUser(userId, userData, token) {
        try {
            console.log(`🔵 Actualizando usuario: ${userId}`);
            const response = await axios.put(`/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            console.error('❌ Error en updateUser:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    async deleteUser(userId, token) {
        try {
            console.log(`🔵 Eliminando usuario: ${userId}`);
            const response = await axios.delete(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error en deleteUser:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    // ========== BICICLETAS ==========
    async getBicycles(token) {
        try {
            console.log('🔵 Obteniendo bicicletas...');
            const response = await axios.get('/bicycles');
            return response.data;
        } catch (error) {
            console.error('❌ Error en getBicycles:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión',
                data: [] 
            };
        }
    },

    async registerBicycle(bicycleData, token) {
        try {
            console.log('🔵 Registrando bicicleta...');
            const response = await axios.post('/bicycles', bicycleData);
            return response.data;
        } catch (error) {
            console.error('❌ Error en registerBicycle:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    },

    // ========== DASHBOARD ==========
    async getDashboardData(token) {
        try {
            console.log('🔵 Obteniendo datos del dashboard...');
            const response = await axios.get('/dashboard');
            return response.data;
        } catch (error) {
            console.error('❌ Error en getDashboardData:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Error de conexión' 
            };
        }
    }
};

export default apiService;