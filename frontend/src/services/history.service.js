// history.service.js - CON API_URL AGREGADO
import apiService from './api.service.js';
import { getToken } from './auth.service';

// AÑADE ESTA LÍNEA (sin process.env):
const API_URL = 'http://localhost:3000/api';

const HistoryService = {
  // Corresponde a http://localhost:3000/api/history/occupancy
  getOccupancyHistory: async (page = 1, limit = 10) => {
    const token = getToken();
    const endpoint = `history/occupancy?page=${page}&limit=${limit}`;
    // Usamos el método genérico de tu apiService si existe, 
    // o un fetch directo si prefieres
    const response = await fetch(`${API_URL}/${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  // Corresponde a http://localhost:3000/api/history/guards
  getGuardsHistory: async (page = 1, limit = 10) => {
    const token = getToken();
    const endpoint = `history/guards?page=${page}&limit=${limit}`;
    const response = await fetch(`${API_URL}/${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  },

  // 3. NUEVO: Historial de un bicicletero específico (Movido de bikerack.service)
  getBikerackActions: async (bicicleteroId) => {
    try {
      const token = getToken();
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`${API_URL}/history/bikerack/${bicicleteroId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      // Mantenemos tu lógica de devolver solo el array de datos
      return result.data || []; 
    } catch (error) {
      console.error(`Error en getBikerackActions para ID ${bicicleteroId}:`, error);
      throw error;
    }
  }
};

export default HistoryService;