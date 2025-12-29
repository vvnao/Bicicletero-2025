// src/services/api.service.js

// URL base de la API, definida en variables de entorno Vite
const API_URL = import.meta.env.VITE_API_URL;

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
        if (!text) return { success: false, message: "Respuesta vacía del servidor" };
        try {
            return JSON.parse(text);
        } catch {
            return { success: true, data: text || {} };
        }
    }
};

const createFetchConfig = (method = 'GET', body = null, token = null) => {
    const config = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) config.body = JSON.stringify(body);
    return config;
};

const apiService = {
    // ========== GUARDIAS ==========
    async getGuards(token) {
        try {
            const response = await fetch(`${API_URL}/guards`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error en getGuards:', error);
            return { success: false, message: error.message || 'Error de conexión', data: [] };
        }
    },

    async createGuard(guardData, token) {
        try {
            const response = await fetch(`${API_URL}/guards`, createFetchConfig('POST', guardData, token));
            return await handleResponse(response);
        } catch (error) {
            console.error('Error en createGuard:', error);
            return { success: false, message: error.message || 'Error de conexión' };
        }
    },

    async toggleGuardAvailability(id, isAvailable, token) {
        try {
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
        try {
            const response = await fetch(`${API_URL}/bikeracks`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                return { success: false, message: 'Sesión expirada. Por favor, inicia sesión nuevamente.', data: [] };
            }

            const result = await handleResponse(response);
            return (result && result.success && Array.isArray(result.data)) ? result : { success: false, message: result?.message || 'Formato inválido del servidor', data: [] };
        } catch (error) {
            console.error('Error crítico en getBikeracks:', error);
            if (error.message.includes('401') || error.message.includes('token')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                return { success: false, message: 'Sesión expirada. Por favor, inicia sesión nuevamente.', data: [] };
            }
            return { success: false, message: error.message || 'Error de conexión con el servidor', data: [] };
        }
    },

    // ========== ASIGNACIONES ==========
    async getGuardAssignments(token, guardId = null) {
        try {
            const endpoint = guardId ? `/guard-assignments/guard/${guardId}` : '/guard-assignments';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error en getGuardAssignments:', error);
            return { success: false, message: error.message || 'Error de conexión', data: [] };
        }
    },

    async checkAvailability(params, token) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_URL}/guard-assignments/check-availability?${queryString}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error checking availability:', error);
            return { success: false, message: error.message || 'Error de conexión', data: { availableBikeracks: [] } };
        }
    },

    async deleteAssignment(assignmentId, token) {
        try {
            const response = await fetch(`${API_URL}/guard-assignments/${assignmentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error deleting assignment:', error);
            return { success: false, message: error.message || 'Error de conexión' };
        }
    },

    async createAssignment(assignmentData, token) {
        try {
            const response = await fetch(`${API_URL}/guard-assignments`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentData)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error en createAssignment:', error);
            return { success: false, message: error.message || 'Error de conexión' };
        }
    },

    // ========== AUTH ==========
    async validateToken(token) {
        try {
            const response = await fetch(`${API_URL}/auth/validate`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error validating token:', error);
            return { success: false, message: 'Token inválido o expirado' };
        }
    }
};

export default apiService;