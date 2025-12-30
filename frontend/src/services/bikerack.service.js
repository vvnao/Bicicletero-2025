// bikerack.service.js - VERSIÓN CORREGIDA CON RUTAS CORRECTAS
import axios from './root.service';

// ==================== BICICLETEROS - DASHBOARD ====================
export async function getBikeracks() {
  try {
    const response = await axios.get('/bikeracks/dashboard'); // CORRECTO: sin /api
    const backendData = response.data?.data || [];
    
    const bicicleterosMapeados = backendData.map(bicicletero => {
      const totalOcupado = bicicletero.occupiedSpaces + bicicletero.reservedSpaces + bicicletero.overdueSpaces;
      const occupationPercentage = bicicletero.capacity > 0 
        ? Math.round((totalOcupado / bicicletero.capacity) * 100) 
        : 0;
      
      let status = 'Activo';
      if (occupationPercentage >= 100) status = 'Lleno';
      else if (occupationPercentage >= 80) status = 'Casi lleno';
      else if (occupationPercentage <= 10) status = 'Vacío';
      
      const colores = [
        { contenedor: '#3c84f6', sombra: '#1d51a5ff' },
        { contenedor: '#32bb94', sombra: '#208367ff' },
        { contenedor: '#ffde69', sombra: '#b19b4dff' },
        { contenedor: '#fd7452', sombra: '#b85138ff' }
      ];
      
      const colorIndex = (bicicletero.id - 1) % 4;
      
      return {
        id: bicicletero.id,
        name: bicicletero.name,
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

// ==================== ACCIONES/HISTORIAL ====================
// Archivo: src/services/bikerack.service.js (FRONTEND)

export async function getBikerackActions(bikerackId) {
  try {
    console.log(`[BikerackService] 🔍 Llamando a: /history/bikerack/${bikerackId}?limit=20`);
    
    const response = await axios.get(`/history/bikerack/${bikerackId}?limit=20`);
    
    console.log(`[BikerackService] ✅ Respuesta:`, response.data.message);
    console.log(`[BikerackService] 📊 Total registros:`, response.data.data?.data?.length || 0);
    
    if (response.data && response.data.data?.data) {
      const historialData = response.data.data.data; // ← OJO: data.data.data
      
      // DEBUG: Ver qué recibimos
      console.log('[BikerackService] 📋 Estructura recibida:');
      if (historialData.length > 0) {
        console.log('Primer registro completo:', JSON.stringify(historialData[0], null, 2));
      }
      
      // Mapear a formato de tabla
      const acciones = historialData.map((item, index) => {
        console.log(`[${index}] Procesando:`, {
          id: item.id,
          descripcion: item.description,
          type: item.type,
          tieneBikerack: !!item.bikerack,
          bikerackId: item.bikerack?.id,
          espacio: item.space?.spaceCode
        });
        
        // 1. Determinar TIPO
        let tipo = 'default';
        if (item.type === 'user_checkin') tipo = 'ingreso';
        else if (item.type === 'user_checkout') tipo = 'salida';
        else if (item.type === 'infraction') tipo = 'incidente';
        else if (item.type === 'reservation_create') tipo = 'reserva';
        else if (item.type === 'reservation_cancel') tipo = 'cancelacion';
        else if (item.type === 'bicycle_register') tipo = 'registro';
        else {
          // Si type es null, adivinar por descripción
          const desc = (item.description || '').toLowerCase();
          if (desc.includes('reserva') && desc.includes('creada')) tipo = 'reserva';
          else if (desc.includes('ingreso') || desc.includes('check-in')) tipo = 'ingreso';
          else if (desc.includes('salida') || desc.includes('check-out')) tipo = 'salida';
          else if (desc.includes('infracción') || desc.includes('infraccion')) tipo = 'incidente';
        }
        
        // 2. Obtener USUARIO
        let usuario = 'Sistema';
        if (item.user) {
          if (item.user.names && item.user.lastName) {
            usuario = `${item.user.names} ${item.user.lastName}`;
          } else if (item.user.email) {
            usuario = item.user.email.split('@')[0];
          }
        }
        
        // 3. Obtener ESPACIO
       let espacio = 'N/A';

// Primero intentar desde space.spaceCode
if (item.space?.spaceCode) {
  espacio = item.space.spaceCode;
} 
// Luego intentar desde details.spaceCode
else if (item.details?.spaceCode) {
  espacio = item.details.spaceCode;
}
// Si no existe, intentar extraer de la descripción
else if (item.description) {
  // Buscar patrones como "espacio E-1" o "Código R4394 para el espacio E-1"
  const match = item.description.match(/espacio ([A-Z]-\d+)/i);
  if (match && match[1]) {
    espacio = match[1];
  }
}
        // 4. Obtener CÓDIGO RESERVA
        let reservationCode = null;
        if (item.details?.reservationCode) {
          reservationCode = item.details.reservationCode;
        }
        
        return {
          id: item.id || `temp-${index}`,
          tipo: tipo,
          descripcion: item.description || 'Sin descripción',
          usuario: usuario,
          fecha: item.created_at || new Date().toISOString(),
          rut: item.user?.rut || 'N/A',
          bicicleta: item.bicycle?.id || 'N/A',
          guardia: item.guard?.names || null,
          espacio: espacio,
          reservationCode: reservationCode,
          // Datos extra para debug
          _rawType: item.type,
          _hasBikerack: !!item.bikerack,
          _bikerackId: item.bikerack?.id
        };
      });
      
      console.log(`[BikerackService] ✨ ${acciones.length} acciones mapeadas`);
      if (acciones.length > 0) {
        console.log('Primera acción mapeada:', acciones[0]);
      }
      
      return acciones;
    }
    
    console.log('[BikerackService] ⚠️ No hay data.data.data');
    return [];
    
  } catch (error) {
    console.error(`[BikerackService] ❌ Error:`, error.message);
    if (error.response) {
      console.error('Detalles error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    return [];
  }
}


// ==================== DETALLE DE BICICLETERO ====================
export async function getBikerackDetail(id) {
  try {
    const response = await axios.get(`/bikeracks/${id}`);
    const backendData = response.data?.data || response.data;
    
    if (backendData.bikerack && backendData.spaces) {
      return backendData;
    }
    
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

// Función auxiliar
function obtenerUbicacionPorNombre(nombre) {
  const ubicaciones = {
    'NORTE': 'Entrada sur, frente a biblioteca',
    'SUR': 'Estacionamiento central',
    'ESTE': 'Ubicación por definir',
    'CENTRAL': 'Entrada principal norte del campus'
  };
  
  const nombreUpper = nombre.toUpperCase();
  return ubicaciones[nombreUpper] || 
         ubicaciones[nombreUpper.replace('BICICLETERO ', '')] || 
         'Ubicación no especificada';
}

// ==================== SERVICIO PRINCIPAL ====================

const bikerackService = {
  getAll: getBikeracks,
  getById: getBikerackDetail,
  getBikerackActions,
  
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