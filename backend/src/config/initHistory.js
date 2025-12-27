// src/config/initHistory.js
'use strict';

import { AppDataSource } from './configDb.js';
import { createHistoryEvent } from '../helpers/historyHelper.js';

export async function createInitialHistory() {
  try {
    const historyRepo = AppDataSource.getRepository('History');
    
    const count = await historyRepo.count();
    if (count > 20) {
      console.log('✅ Ya existe historial suficiente');
      return;
    }
    
    console.log('📝 Creando eventos de historial inicial...');
    
    // Obtener datos existentes
    const userRepo = AppDataSource.getRepository('User');
    const bicycleRepo = AppDataSource.getRepository('Bicycle');
    const bikerackRepo = AppDataSource.getRepository('Bikerack');
    const reservationRepo = AppDataSource.getRepository('Reservation');
    
    const [users, bicycles, bikeracks, reservations] = await Promise.all([
      userRepo.find({ take: 3 }),
      bicycleRepo.find({ relations: ['user'], take: 3 }),
      bikerackRepo.find({ take: 2 }),
      reservationRepo.find({ relations: ['user', 'space'], take: 2 })
    ]);
    
    const historyEvents = [];
    
    // Eventos de registro de usuarios
    users.forEach((user, index) => {
      historyEvents.push({
        historyType: 'user_registration',
        description: `Usuario ${user.names} ${user.lastName} se registró`,
        details: { email: user.email, role: user.role },
        userId: user.id,
        actionBy: 1,
        timestamp: new Date(Date.now() - (index * 3600000))
      });
    });
    
    // Eventos de bicicletas
    if (bicycles.length > 0) {
      bicycles.forEach((bicycle, index) => {
        if (bicycle.user) {
          historyEvents.push({
            historyType: 'bicycle_registered',
            description: `Bicicleta ${bicycle.brand} registrada`,
            details: { brand: bicycle.brand, serial: bicycle.serialNumber },
            userId: bicycle.user.id,
            bicycleId: bicycle.id,
            timestamp: new Date(Date.now() - (index * 7200000))
          });
        }
      });
    }
    
    // Eventos de check-in/check-out
    if (reservations.length > 0) {
      reservations.forEach((reservation, index) => {
        if (reservation.user && reservation.space) {
          // Check-in
          historyEvents.push({
            historyType: 'check_in',
            description: `Check-in en ${reservation.space.spaceCode}`,
            details: { reservation: reservation.reservationCode },
            userId: reservation.user.id,
            spaceId: reservation.space.id,
            reservationId: reservation.id,
            timestamp: new Date(Date.now() - (index * 3600000))
          });
          
          // Check-out simulado
          historyEvents.push({
            historyType: 'check_out',
            description: `Check-out de ${reservation.space.spaceCode}`,
            details: { reservation: reservation.reservationCode },
            userId: reservation.user.id,
            spaceId: reservation.space.id,
            reservationId: reservation.id,
            timestamp: new Date(Date.now() - (index * 1800000))
          });
        }
      });
    }
    
    // Evento de sistema
    historyEvents.push({
      historyType: 'system_startup',
      description: 'Sistema inicializado con datos de prueba',
      details: { version: '1.0.0', environment: process.env.NODE_ENV },
      timestamp: new Date()
    });
    
    // Crear eventos
    let createdCount = 0;
    for (const event of historyEvents) {
      try {
        await createHistoryEvent(event);
        createdCount++;
      } catch (error) {
        console.log(`⚠️  No se pudo crear evento: ${event.description}`);
      }
    }
    
    console.log(`✅ ${createdCount} eventos de historial creados`);
    
  } catch (error) {
    console.error('❌ Error creando historial inicial:', error.message);
  }
}