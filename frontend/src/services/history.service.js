// history.service.js - SÓLO SERVICIO DE API
import axios from './root.service.js';

const HistoryService = {
  getOccupancyHistory: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/history/occupancy`); // Sin /api
      return response.data;
    } catch (error) {
      console.error('Error en getOccupancyHistory:', error);
      throw error;
    }
  },

  getGuardsHistory: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/history/guards`); 
      return response.data;
    } catch (error) {
      console.error('Error en getGuardsHistory:', error);
      throw error;
    }
  },

  getManagementMovements: async (page = 1, limit = 10) => {
     try {
      const response = await axios.get(`/history/management`); 
      return response.data;
    } catch (error) {
      console.error('Error en getManagementMovements:', error);
      throw error;
    }
  },
    getBicyclesHistory: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/history/bicycles?page=${page}&limit=${limit}`);
      console.log('📊 Respuesta bicicletas:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de bicicletas:', error);
      throw error;
    }
  },

   getBikerackHistory: async (bikerackId, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/history/bikerack/${bikerackId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial del bicicletero:', error);
      throw error;
    }
  }
};

export default HistoryService;