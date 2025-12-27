// src/config/initReservationsDb.js - VERSIÓN CON HISTORIAL
'use strict';
import { AppDataSource } from './configDb.js';
import { ReservationEntity } from '../entities/ReservationEntity.js';
import { SpaceEntity } from '../entities/SpaceEntity.js';
import { UserEntity } from '../entities/UserEntity.js';
import { BicycleEntity } from '../entities/BicycleEntity.js';
import { createHistoryEvent } from '../helpers/historyHelper.js';

export async function createReservations() {
  try {
    const reservationRepo = AppDataSource.getRepository(ReservationEntity);
    const spaceRepo = AppDataSource.getRepository(SpaceEntity);
    const userRepo = AppDataSource.getRepository('User');
    const bicycleRepo = AppDataSource.getRepository('Bicycle');
    
    const count = await reservationRepo.count();
    if (count > 0) {
      console.log(`✅ Ya existen ${count} reservas`);
      return;
    }

    // Buscar datos para crear reservas
    const users = await userRepo.find({ 
      where: { role: 'user' }, 
      take: 3 
    });
    const bicycles = await bicycleRepo.find({ 
      relations: ['user'],
      take: 3 
    });
    const spaces = await spaceRepo.find({ 
      where: { status: 'free' }, 
      take: 3 
    });

    if (users.length === 0 || bicycles.length === 0 || spaces.length === 0) {
      console.log('⚠️  No hay suficientes datos para crear reservas');
      return;
    }

    console.log(`📅 Creando ${Math.min(users.length, spaces.length)} reservas...`);

    const reservations = [];
    for (let i = 0; i < Math.min(users.length, spaces.length); i++) {
      const user = users[i];
      const bicycle = bicycles[i % bicycles.length];
      const space = spaces[i];

      // Crear reserva
      const reservation = reservationRepo.create({
        reservationCode: `RES-${Date.now().toString().slice(-6)}-${i+1}`,
        dateTimeReservation: new Date(),
        estimatedHours: 3,
        expirationTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        status: 'Activa',
        checkInTime: new Date(),
        space: space,
        user: user,
        bicycle: bicycle,
      });
      
      const savedReservation = await reservationRepo.save(reservation);
      reservations.push(savedReservation);
      
      // Actualizar espacio
      space.status = 'occupied';
      await spaceRepo.save(space);
      
      console.log(`   ✅ ${user.names} → ${space.spaceCode}`);
      
      // ===== CREAR EVENTO DE HISTORIAL =====
      await createHistoryEvent(user, space, savedReservation);
    }

    console.log(`📊 ${reservations.length} reservas creadas con historial`);
    
  } catch (error) {
    console.error('❌ Error al crear reservas:', error.message);
  }
}

// Función para crear evento de historial
async function createHistoryEvent(user, space, reservation) {
  try {
    const historyRepo = AppDataSource.getRepository('History');
    
    const historyEvent = historyRepo.create({
      historyType: 'check_in',
      description: `✅ ${user.names} realizó check-in`,
      details: {
        user_email: user.email,
        space_code: space.spaceCode,
        bikerack: space.bikerack?.name || 'Desconocido',
        reservation_code: reservation.reservationCode,
        estimated_hours: reservation.estimatedHours
      },
      user: user,
      space: space,
      bikerack: space.bikerack,
      reservation: reservation,
      timestamp: new Date()
    });
    
    await historyRepo.save(historyEvent);
    console.log(`   📝 Historial creado para ${user.names}`);
    
  } catch (error) {
    console.log(`   ⚠️  No se pudo crear historial: ${error.message}`);
  }
}

await createHistoryEvent({
  historyType: 'tipo_de_evento',
  description: 'Descripción del evento',
  details: { /* datos adicionales */ },
  userId: usuario.id,
  // ... otros IDs según corresponda
});