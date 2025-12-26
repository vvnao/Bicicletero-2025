/*//! ARCHIVO TEMPORAL POR QUE AÚN NO IMPLEMENTO EL SISTEMA PARA CREAR RESERVAS
'use strict';
import { AppDataSource } from './configDb.js';
import {
  ReservationEntity,
  RESERVATION_STATUS,
} from '../entities/ReservationEntity.js';
import { SpaceEntity } from '../entities/SpaceEntity.js';
import { UserEntity } from '../entities/UserEntity.js';
import { BicycleEntity } from '../entities/BicycleEntity.js';

export async function createReservations() {
  try {
    const reservationRepository = AppDataSource.getRepository(ReservationEntity);
    const spaceRepository = AppDataSource.getRepository(SpaceEntity);
    const userRepository = AppDataSource.getRepository(UserEntity);
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

    const count = await reservationRepository.count();
    if (count > 0) return;

    //* para buscar espacios libres
    const spaces = await spaceRepository.find({
      where: { status: 'Libre' },
      take: 3,
    });

    //* para buscar usuarios y bicicletas existentes
    const users = await userRepository.find({ take: 2 });
    const bicycles = await bicycleRepository.find({ take: 2 });

    //* para verificar que hay suficientes datos para crear reservas
    if (spaces.length === 0 || users.length === 0 || bicycles.length === 0) {
      console.log('No hay suficientes datos para crear reservas de prueba');
      return;
    }

    const reservations = [
      {
        reservationCode: 'RES-001',
        dateTimeReservation: new Date(),
        estimatedHours: 4,
        expirationTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: RESERVATION_STATUS.PENDING,
        space: spaces[0],
        user: users[0],
        bicycle: bicycles[0],
      },
      {
        reservationCode: 'RES-002',
        dateTimeReservation: new Date(),
        estimatedHours: 6,
        expirationTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: RESERVATION_STATUS.PENDING,
        space: spaces[1],
        user: users[1],
        bicycle: bicycles[1],
      },
      {
        reservationCode: 'RES-003',
        dateTimeReservation: new Date(),
        estimatedHours: 3,
        expirationTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: RESERVATION_STATUS.PENDING,
        space: spaces[2],
        user: users[0],
        bicycle: bicycles[0],
      },
    ];

    console.log('Creando reservas...');

    for (const reservation of reservations) {
      await reservationRepository.save(
        reservationRepository.create(reservation)
      );
      console.log(
        `Reserva ${reservation.reservationCode} creada exitosamente!`
      );
    }

    console.log('Todas las reservas creadas exitosamente!');
  } catch (error) {
    console.error('Error al crear reservas:', error);
  }
}

*/
