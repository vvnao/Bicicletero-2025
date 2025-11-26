import { AppDataSource } from '../config/configDb.js';
import { SPACE_STATUS } from '../entities/SpaceEntity.js';
import { RESERVATION_STATUS } from '../entities/ReservationEntity.js';

const reservationRepository = AppDataSource.getRepository('Reservation');
const spaceRepository = AppDataSource.getRepository('Space');
const userRepository = AppDataSource.getRepository('User');
const bicycleRepository = AppDataSource.getRepository('Bicycle');

////////////////////////////////////////////////////////////////////////////////////////////
//! CREAR RESERVA AUTOMÁTICA
export async function createAutomaticReservation(
  userId,
  bikerackId,
  estimatedHours,
  bicycleId
) {
  try {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const bicycle = await bicycleRepository.findOne({
      where: { id: bicycleId, user: { id: userId } },
    });
    if (!bicycle) {
      throw new Error('Bicicleta no encontrada o no pertenece al usuario');
    }

    const space = await getNextAvailableSpace(bikerackId);
    if (!space) {
      throw new Error('No hay espacios disponibles en este bicicletero');
    }

    const reservationCode = `RES-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    const expirationTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const reservation = reservationRepository.create({
      reservationCode,
      estimatedHours,
      expirationTime,
      status: RESERVATION_STATUS.PENDING,
      space: space,
      user: user,
      bicycle: bicycle,
    });

    space.status = SPACE_STATUS.RESERVED;

    await spaceRepository.save(space);
    await reservationRepository.save(reservation);

    console.log(
      `Reserva ${reservationCode} creada para espacio ${space.spaceCode}`
    );

    const reservationWithRelations = await reservationRepository.findOne({
      where: { id: reservation.id },
      relations: ['user', 'space', 'space.bikerack', 'bicycle'],
    });

    return reservationWithRelations;

  } catch (error) {
    throw new Error(`Error creando reserva: ${error.message}`);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! OBTENER PRÓXIMO ESPACIO DISPONIBLE
//! REVISAR ESTA DESPUÉS
export async function getNextAvailableSpace(bikerackId) {
  try {
    const spaces = await spaceRepository.find({
      where: {
        bikerack: { id: bikerackId },
        status: SPACE_STATUS.FREE,
      },
      order: { position: 'ASC' },
    });

    return spaces[0]; 
  } catch (error) {
    throw new Error(`Error buscando espacio disponible: ${error.message}`);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! CANCELAR RESERVA
export async function cancelReservation(reservationId, userId) {
  try {
    const reservation = await reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['space', 'user', 'bicycle'],
    });

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    if (reservation.user.id !== userId) {
      throw new Error('No autorizado para cancelar esta reserva');
    }

    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      throw new Error('Solo se pueden cancelar reservas pendientes');
    }

    reservation.space.status = SPACE_STATUS.FREE;
    reservation.status = RESERVATION_STATUS.CANCELED;

    await spaceRepository.save(reservation.space);
    await reservationRepository.save(reservation);

    return {
      reservation,
      space: reservation.space,
      user: reservation.user,
    };
  } catch (error) {
    throw new Error(`Error cancelando reserva: ${error.message}`);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! OBTENER RESERVAS DE UN USUARIO
export async function getUserReservations(userId) {
  try {
    const reservations = await reservationRepository.find({
      where: { user: { id: userId } },
      relations: ['space', 'space.bikerack', 'bicycle'],
      order: { created_at: 'DESC' },
    });

    return reservations.map((reservation) => ({
      id: reservation.id,
      reservationCode: reservation.reservationCode,
      status: reservation.status,
      spaceCode: reservation.space.spaceCode,
      bikerackName: reservation.space.bikerack.name,
      estimatedHours: reservation.estimatedHours,
      expirationTime: reservation.expirationTime,
      bicycle: {
        brand: reservation.bicycle.brand,
        model: reservation.bicycle.model,
        color: reservation.bicycle.color,
      },
      createdAt: reservation.created_at,
    }));
  } catch (error) {
    throw new Error(`Error obteniendo reservas: ${error.message}`);
  }
}

