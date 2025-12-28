// src/helpers/historyHelper.js - ACTUALIZADO CON TIPOS CORRECTOS
'use strict';

// CORRECCIÓN: Importa desde la ubicación correcta
import { AppDataSource } from '../config/configDb.js';

export async function createHistoryEvent(eventData) {
  try {
    const historyRepo = AppDataSource.getRepository('History');
    
    const historyEvent = historyRepo.create({
      historyType: eventData.historyType || 'system_notification',
      description: eventData.description || 'Evento del sistema',
      details: eventData.details || {},
      user: eventData.userId ? { id: eventData.userId } : null,
      guard: eventData.guardId ? { id: eventData.guardId } : null,
      bicycle: eventData.bicycleId ? { id: eventData.bicycleId } : null,
      space: eventData.spaceId ? { id: eventData.spaceId } : null,
      bikerack: eventData.bikerackId ? { id: eventData.bikerackId } : null,
      reservation: eventData.reservationId ? { id: eventData.reservationId } : null,
      assignment: eventData.assignmentId ? { id: eventData.assignmentId } : null,
      timestamp: eventData.timestamp || new Date(),
      ipAddress: eventData.ipAddress || null,
      userAgent: eventData.userAgent || null
    });
    
    await historyRepo.save(historyEvent);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Historial creado: ${eventData.description}`);
    }
    
    return historyEvent;
  } catch (error) {
    console.error('❌ Error creando evento de historial:', error.message);
    
    // En desarrollo, muestra más detalles
    if (process.env.NODE_ENV === 'development') {
      console.error('Datos del evento:', eventData);
    }
    
    throw error;
  }
}

// Función para crear múltiples eventos de historial
export async function createBatchHistoryEvents(events) {
  try {
    const historyRepo = AppDataSource.getRepository('History');
    const savedEvents = [];
    
    for (const eventData of events) {
      try {
        const historyEvent = await createHistoryEvent(eventData);
        savedEvents.push(historyEvent);
      } catch (error) {
        console.error(`⚠️  Error con evento: ${eventData.description}`);
      }
    }
    
    return savedEvents;
  } catch (error) {
    console.error('❌ Error creando eventos en batch:', error);
    throw error;
  }
}

// Función auxiliar para eventos comunes CON TIPOS CORRECTOS
export const HistoryHelper = {
  userCheckIn: (user, space, reservation) => ({
    historyType: 'user_checkin',
    description: `✅ ${user.names} realizó check-in`,
    details: {
      space_code: space.spaceCode,
      reservation_code: reservation.reservationCode,
      estimated_hours: reservation.estimatedHours
    },
    userId: user.id,
    spaceId: space.id,
    reservationId: reservation.id
  }),
  
  userCheckOut: (user, space, reservation) => ({
    historyType: 'user_checkout',
    description: `🚪 ${user.names} realizó check-out`,
    details: {
      space_code: space.spaceCode,
      reservation_code: reservation.reservationCode,
      duration_hours: reservation.actualHours || 'N/A'
    },
    userId: user.id,
    spaceId: space.id,
    reservationId: reservation.id
  }),
  
  bicycleRegistration: (user, bicycle) => ({
    historyType: 'bicycle_registration', // ← CORRECTO
    description: `🚲 ${user.names} registró bicicleta ${bicycle.brand}`,
    details: { 
      brand: bicycle.brand, 
      model: bicycle.model,
      serialNumber: bicycle.serialNumber 
    },
    userId: user.id,
    bicycleId: bicycle.id
  }),
  
  guardCreated: (guard, adminId) => ({
    historyType: 'guard_created',
    description: `👮 Guardia ${guard.user.names} creado`,
    details: {
      guard_number: guard.guardNumber,
      email: guard.user.email
    },
    guardId: guard.user.id,
    actionBy: adminId
  }),
  
  guardAssignment: (guard, bikerack, adminId) => ({
    historyType: 'guard_assignment',
    description: `👮 ${guard.user.names} asignado a ${bikerack.name}`,
    details: {
      guard_number: guard.guardNumber,
      bikerack: bikerack.name,
      schedule: 'Lunes a Sábado'
    },
    guardId: guard.user.id,
    bikerackId: bikerack.id,
    actionBy: adminId
  }),
  
  adminAction: (admin, action, target) => ({
    historyType: 'admin_action',
    description: `👑 ${admin.names} realizó acción: ${action}`,
    details: {
      action: action,
      target: target || 'Sistema'
    },
    userId: admin.id
  }),
  
  systemNotification: (message, details = {}) => ({
    historyType: 'system_notification',
    description: `🔔 ${message}`,
    details: details
  })
};