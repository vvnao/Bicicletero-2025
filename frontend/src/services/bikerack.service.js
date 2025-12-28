// bikerack.service.js - VERSIÓN ACTUALIZADA PARA EL DASHBOARD
import axios from './root.service';

// ==================== BICICLETEROS - DASHBOARD ====================
export async function getBikeracks() {
  try {
    const response = await axios.get('/bikeracks/dashboard');
    
    // Mapear la respuesta del backend al formato que espera el frontend
    const backendData = response.data?.data || [];
    
    const bicicleterosMapeados = backendData.map(bicicletero => {
      // Calcular porcentaje de ocupación
      const totalOcupado = bicicletero.occupiedSpaces + bicicletero.reservedSpaces + bicicletero.overdueSpaces;
      const occupationPercentage = bicicletero.capacity > 0 
        ? Math.round((totalOcupado / bicicletero.capacity) * 100) 
        : 0;
      
      // Determinar estado según porcentaje
      let status = 'Activo';
      if (occupationPercentage >= 100) status = 'Lleno';
      else if (occupationPercentage >= 80) status = 'Casi lleno';
      else if (occupationPercentage <= 10) status = 'Vacío';
      
      // Mapear a colores según el ID del bicicletero
      const colores = [
        { contenedor: '#3c84f6', sombra: '#1d51a5ff' }, // Norte - Azul
        { contenedor: '#32bb94', sombra: '#208367ff' }, // Sur - Verde
        { contenedor: '#ffde69', sombra: '#b19b4dff' }, // Este - Amarillo
        { contenedor: '#fd7452', sombra: '#b85138ff' }  // Central - Naranja
      ];
      
      const colorIndex = (bicicletero.id - 1) % 4;
      
      return {
        id: bicicletero.id,
        name: bicicletero.name,
        // Los iconos se mantienen del frontend
        capacidad: bicicletero.capacity,
        occupied: bicicletero.occupiedSpaces,
        free: bicicletero.availableSpaces,
        reserved: bicicletero.reservedSpaces,
        overdue: bicicletero.overdueSpaces,
        occupationPercentage,
        status,
        ubicacion: obtenerUbicacionPorNombre(bicicletero.name),
        colorContenedor: colores[colorIndex].contenedor,
        colorSombra: colores[colorIndex].sombra,
        lastUpdate: bicicletero.lastUpdate
      };
    });
    
    return bicicleterosMapeados;
  } catch (error) {
    console.error('Error al obtener bicicleteros:', error);
    throw error;
  }
}

// Función auxiliar para obtener ubicación según nombre
function obtenerUbicacionPorNombre(nombre) {
  const ubicaciones = {
    'NORTE': 'Entrada sur, frente a biblioteca',
    'SUR': 'Estacionamiento central',
    'ESTE': 'Ubicación por definir',
    'CENTRAL': 'Entrada principal norte del campus',
    'BICICLETERO NORTE': 'Entrada sur, frente a biblioteca',
    'BICICLETERO SUR': 'Estacionamiento central',
    'BICICLETERO ESTE': 'Ubicación por definir',
    'BICICLETERO CENTRAL': 'Entrada principal norte del campus'
  };
  
  return ubicaciones[nombre.toUpperCase()] || 'Ubicación no especificada';
}

// ==================== ACCIONES/RESERVAS ====================
export async function getBikerackActions(bikerackId) {
  try {
    // Endpoint para obtener reservas de un bicicletero específico
    const response = await axios.get(`/reservations?bikerackId=${bikerackId}&limit=20`);
    
    const reservas = response.data?.data || response.data || [];
    
    // Mapear reservas a "acciones" para el frontend
    const acciones = reservas.map(reserva => {
      let tipo = 'reserva';
      
      // Determinar tipo de acción basado en estado
      if (reserva.status === 'CANCELLED') tipo = 'cancelacion';
      else if (reserva.status === 'ACTIVE' || reserva.status === 'active') {
        tipo = reserva.checkinTime ? 'ingreso' : 'reserva';
      }
      else if (reserva.status === 'COMPLETED') tipo = 'salida';
      
      return {
        id: reserva.id,
        tipo,
        usuario: reserva.user?.names ? `${reserva.user.names} ${reserva.user.lastName}` : 'Usuario',
        rut: reserva.user?.rut || 'N/A',
        bicicleta: reserva.bicycle?.id ? `BIC-${reserva.bicycle.id.toString().padStart(3, '0')}` : 'N/A',
        fecha: reserva.createdAt || new Date().toISOString(),
        guardia: reserva.processedBy?.names || 'Sistema',
        horas: reserva.estimatedHours,
        motivo: reserva.cancellationReason,
        espacio: reserva.space?.spaceCode
      };
    });
    
    return acciones;
  } catch (error) {
    console.error(`Error al obtener acciones del bicicletero ${bikerackId}:`, error);
    return [];
  }
}

// ==================== DETALLE DE BICICLETERO ====================
export async function getBikerackDetail(id) {
  try {
    const response = await axios.get(`/bikeracks/${id}`);
    
    const backendData = response.data?.data || response.data;
    
    // Si el backend ya devuelve la estructura correcta, usarla
    if (backendData.bikerack && backendData.spaces) {
      return backendData;
    }
    
    // Si no, crear una estructura compatible
    const bicicletero = backendData.bikerack || backendData;
    const spaces = backendData.spaces || [];
    
    const spaceCounts = {
      free: spaces.filter(s => s.status === 'FREE').length,
      reserved: spaces.filter(s => s.status === 'RESERVED').length,
      occupied: spaces.filter(s => s.status === 'OCCUPIED').length,
      overdue: spaces.filter(s => s.status === 'TIME_EXCEEDED').length
    };
    
    return {
      bikerack: bicicletero,
      spaces: spaces,
      spaceCounts: spaceCounts
    };
    
  } catch (error) {
    console.error('Error al obtener detalle:', error);
    throw error;
  }
}

// ==================== SERVICIO PRINCIPAL ====================

const bikerackService = {
  // Métodos principales
  getAll: getBikeracks,
  getById: getBikerackDetail,
  getBikerackActions,
  
  // Métodos de gestión de espacios (para guardias)
  occupySpaceWithReservation: async (reservationCode) => {
    const response = await axios.post('/space-management/occupy-with-reservation', { reservationCode });
    return response.data.data;
  },
  
  occupySpaceWithoutReservation: async (spaceId, rut, estimatedHours, bicycleId) => {
    const response = await axios.post(`/space-management/${spaceId}/occupy-without-reservation`, {
      rut,
      estimatedHours,
      bicycleId
    });
    return response.data.data;
  },
  
  liberateSpace: async (spaceId, retrievalCode) => {
    const response = await axios.patch(`/space-management/${spaceId}/liberate`, { retrievalCode });
    return response.data.data;
  }
};

export default bikerackService;