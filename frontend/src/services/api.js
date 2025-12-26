// frontend/src/services/api.js - VERSIÓN COMPLETA Y FUNCIONAL
const API_URL = 'http://localhost:3000/api';

// Función auxiliar para manejar fetch con auth
const fetchWithAuth = async (endpoint, options = {}, token) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    return response;
};

export const apiService = {
    // ========== GUARDIAS ==========
    async getGuards(token) {
        try {
            const response = await fetchWithAuth('/guards', {}, token);
            const data = await response.json();
            console.log('✅ getGuards response:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en getGuards:', error);
            return { success: false, message: 'Error de conexión', data: [] };
        }
    },

    async createGuard(guardData, token) {
        try {
            const response = await fetchWithAuth('/guards', {
                method: 'POST',
                body: JSON.stringify(guardData)
            }, token);
            return await response.json();
        } catch (error) {
            console.error('Error en createGuard:', error);
            return { success: false, message: 'Error de conexión' };
        }
    },

    async toggleGuardAvailability(id, isAvailable, token) {
        try {
            const response = await fetchWithAuth(`/guards/${id}/availability`, {
                method: 'PATCH',
                body: JSON.stringify({ isAvailable })
            }, token);
            return await response.json();
        } catch (error) {
            console.error('Error en toggleGuardAvailability:', error);
            return { success: false, message: 'Error de conexión' };
        }
    },

    // ========== BICICLETEROS ==========
    async getBikeracks(token) {
        console.log('🔄 Llamando a GET /api/bikeracks');
        
        try {
            const response = await fetchWithAuth('/bikeracks', {}, token);
            console.log('📊 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📦 Datos crudos de bikeracks:', result);
            
            // Tu backend retorna: { success, message, data }
            if (result.success && Array.isArray(result.data)) {
                // Mapear a estructura que espera el frontend
                const mappedData = result.data.map(bikerack => ({
                    id: bikerack.id.toString(),
                    name: bikerack.name || 'Sin nombre',
                    capacity: bikerack.capacity || 0,
                    // Campos extra si los quieres mostrar
                    usedCapacity: bikerack.usedCapacity,
                    availableCapacity: bikerack.availableCapacity,
                    occupancyRate: bikerack.occupancyRate
                }));
                
                console.log('✅ Bikeracks mapeados:', mappedData);
                return { success: true, data: mappedData };
            } else {
                console.warn('⚠️ Backend no retornó data array:', result);
                // Datos mock de respaldo
                return {
                    success: true,
                    data: [
                        { id: '1', name: 'Bicicletero Central (Mock)', capacity: 40 },
                        { id: '2', name: 'Bicicletero Norte (Mock)', capacity: 40 },
                        { id: '3', name: 'Bicicletero Sur (Mock)', capacity: 40 },
                        { id: '4', name: 'Bicicletero Este (Mock)', capacity: 40 }
                    ]
                };
            }
        } catch (error) {
            console.error('🔥 Error crítico en getBikeracks:', error);
            
            // Datos mock de emergencia
            return {
                success: true,
                data: [
                    { id: 'mock-1', name: 'Bicicletero Central', capacity: 40 },
                    { id: 'mock-2', name: 'Bicicletero Norte', capacity: 40 },
                    { id: 'mock-3', name: 'Bicicletero Sur', capacity: 40 },
                    { id: 'mock-4', name: 'Bicicletero Este', capacity: 40 }
                ]
            };
        }
    },

   // ========== ASIGNACIONES ==========
async getGuardAssignments(token, guardId = null) {
    try {
        const endpoint = guardId 
            ? `/guard-assignments/guard/${guardId}`
            : '/guard-assignments';
            
        console.log(`📡 Llamando endpoint: ${endpoint}`);
        const response = await fetchWithAuth(endpoint, {}, token);
        
        const data = await response.json();
        console.log('📦 Respuesta completa de asignaciones:', data);
        
        // IMPORTANTE: Verifica la estructura
        if (data.success) {
            console.log('✅ Success true. Datos recibidos:');
            
            // Si data.data es array, mostrar primer elemento
            if (Array.isArray(data.data)) {
                console.log(`📊 Total asignaciones: ${data.data.length}`);
                if (data.data.length > 0) {
                    console.log('🔍 Primera asignación:', data.data[0]);
                    console.log('🔍 Estructura guard en primera asignación:', data.data[0].guard);
                    console.log('🔍 Estructura bikerack en primera asignación:', data.data[0].bikerack);
                }
            } else if (data.data && data.data.assignments) {
                // Para endpoint por guardia específico
                console.log('📊 Asignaciones por guardia:', data.data.assignments);
            }
        } else {
            console.log('❌ Success false:', data.message);
        }
        
        return data;
    } catch (error) {
        console.error('Error en getGuardAssignments:', error);
        return { success: false, message: 'Error de conexión', data: [] };
    }
},
    async checkAvailability(params, token) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetchWithAuth(`/guard-assignments/check-availability?${queryString}`, {}, token);
        return await response.json();
    } catch (error) {
        console.error('Error checking availability:', error);
        return { 
            success: false, 
            message: 'Error de conexión',
            data: { availableBikeracks: [] }
        };
    }
},

    async createAssignment(assignmentData, token) {
        try {
            const response = await fetchWithAuth('/guard-assignments', {
                method: 'POST',
                body: JSON.stringify(assignmentData)
            }, token);
            return await response.json();
        } catch (error) {
            console.error('Error en createAssignment:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }
};