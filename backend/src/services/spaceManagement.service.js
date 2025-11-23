import { AppDataSource } from '../config/configDb.js';
import { SPACE_STATUS } from '../entities/SpaceEntity.js';
import { RESERVATION_STATUS } from '../entities/ReservationEntity.js';

const spaceRepository = AppDataSource.getRepository('Space');
const reservationRepository = AppDataSource.getRepository('Reservation');
const userRepository = AppDataSource.getRepository('User');
////////////////////////////////////////////////////////////////////////////////////////////
//! OCUPAR ESPACIO CON RESERVA (para que guardia pueda marcar como ocupado un espacio reservado)
export async function occupySpaceWithReservation(reservationCode) {
  try {
    //* para buscar reserva por código
    const reservation = await reservationRepository.findOne({
      where: { reservationCode, status: RESERVATION_STATUS.PENDING },
      relations: ['space', 'space.bikerack', 'user'],
    });

    if (!reservation) {
      throw new Error('Reserva no encontrada o ya utilizada!');
    }

    //* para actualizar espacio y reserva
    reservation.space.status = SPACE_STATUS.OCCUPIED;
    reservation.status = RESERVATION_STATUS.ACTIVE;
    reservation.dateTimeActualArrival = new Date();

    await spaceRepository.save(reservation.space);
    await reservationRepository.save(reservation);

    return {
      success: true,
      space: reservation.space,
      reservation,
      user: reservation.user,
    };
  } catch (error) {
    throw new Error(`Error ocupando espacio con reserva: ${error.message}`);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! OCUPAR ESPACIO SIN RESERVA (para que guardia pueda marcar como ocupado manualmente)
export async function occupySpaceWithoutReservation(
  spaceId,
  userRut,
  estimatedHours
) {
  try {
    //* para verificar si el espacio está libre
    const space = await spaceRepository.findOne({
      where: { id: spaceId, status: SPACE_STATUS.FREE },
      relations: ['bikerack'],
    });

    if (!space) {
      throw new Error('Espacio no disponible');
    }

    //* para buscar usuario por rut 
    const user = await userRepository.findOne({
      where: { rut: userRut },
      relations: ['bicycles'],
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    //* para calcular el momento en que el espacio pasa a estar en infracción (con el tiempo de llegada + el tiempo estimado)
    const arrivalTime = new Date();
    const limitTime = new Date(
      arrivalTime.getTime() + estimatedHours * 60 * 60 * 1000
    );

    //* para crear reserva automática AKI EXPLICAR MEJOR
    const reservation = reservationRepository.create({
      reservationCode: `AUTO-${Date.now()}`,
      dateTimeReservation: new Date(),
      estimatedHours: estimatedHours,
      status: RESERVATION_STATUS.ACTIVE,
      space: space,
      user: user,
    });

    //* para actualizar espacio
    space.status = SPACE_STATUS.OCCUPIED;

    await reservationRepository.save(reservation);
    await spaceRepository.save(space);

    return {
      success: true,
      space,
      reservation,
      user,
      bicycles: user.bicycles, //* esto devuelve todas las bicicletas del usuario (así el guardia selecciona 1 sola)
    };
  } catch (error) {
    throw new Error(`Error ocupando espacio sin reserva: ${error.message}`);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! LIBERAR ESPACIO (para cuando usuario retire su bici)
export async function liberateSpace(spaceId) {
  try {
    //* para verificar que el espacio esté ocupado
    const space = await spaceRepository.findOne({
      where: { id: spaceId, status: SPACE_STATUS.OCCUPIED },
      relations: ['bikerack'],
    });

    if (!space) {
      throw new Error('Espacio no encontrado o no está ocupado');
    }

    //* para verificar que existe una reserva ACTIVA para ese espacio (manejo de posibles errores)
    const reservation = await reservationRepository.findOne({
      where: { space: { id: spaceId }, status: RESERVATION_STATUS.ACTIVE },
      relations: ['user'],
    });

    //* para actualizar espacio
    space.status = SPACE_STATUS.FREE;

    //* actualiza reserva si existe
    if (reservation) {
      reservation.status = RESERVATION_STATUS.COMPLETED;
      reservation.dateTimeActualDeparture = new Date();
      await reservationRepository.save(reservation);
    }

    await spaceRepository.save(space);

    return {
      success: true,
      space,
      reservation: reservation || null,
      user: reservation?.user || null,
    };
  } catch (error) {
    throw new Error(`Error liberando espacio: ${error.message}`);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////


