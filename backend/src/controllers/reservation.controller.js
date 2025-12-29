'use strict';
import { In } from 'typeorm';
import {getUserBicycles,createAutomaticReservation,cancelReservation,getUserReservations, getAvailableSpaces} from '../services/reservation.service.js';
import HistoryService from '../services/history.service.js';
import {handleSuccess,handleErrorClient,handleErrorServer} from '../Handlers/responseHandlers.js';
import { sendEmail } from '../services/email.service.js';
import { emailTemplates } from '../templates/reservationEmail.template.js';
import { AppDataSource } from '../config/configDb.js';
import { RESERVATION_STATUS, ReservationEntity } from '../entities/ReservationEntity.js';
////////////////////////////////////////////////////////////////////////////////////////////
//! OBTENER LAS BICIS DEL USUARIO PARA QUE PUEDA SELECCIONAR 1 EN LA RESERVA
export async function getUserBicyclesForReservation(req, res) {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      return handleErrorClient(res, 400, 'ID de usuario inválido');
    }

    const bicycles = await getUserBicycles(parseInt(userId));

    handleSuccess(res, 200, 'Bicicletas obtenidas exitosamente', bicycles);
  } catch (error) {
    console.error('Error en getUserBicyclesForReservation:', error.message);

    if (error.message.includes('Usuario no encontrado')) {
      return handleErrorClient(res, 404, error.message);
    }
    handleErrorServer(res, 500, 'Error al obtener las bicicletas');
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! CREAR RESERVA AUTOMÁTICA
export async function createReservation(req, res) {
  try {
    const userId =req.user.id;
    const { bikerackId, estimatedHours, bicycleId } = req.body;

    if(!userId){
      return handleErrorClient(res,404,'Usuario no encontrado o no posee los permisos');
    }
    if (!bikerackId || !estimatedHours || !bicycleId) {
      return handleErrorClient(res, 400, 'Faltan campos obligatorios');
    }

    if (
      isNaN(parseInt(userId)) ||
      isNaN(parseInt(bikerackId)) ||
      isNaN(parseInt(bicycleId))
    ) {
      return handleErrorClient(res, 400, 'Los IDs deben ser números válidos');
    }

    const hours = parseFloat(estimatedHours);
    if (isNaN(hours) || hours < 1 || hours > 24) {
      return handleErrorClient(
        res,
        400,
        'Las horas deben ser un número entre 1 y 24'
      );
    }

    const reservation = await createAutomaticReservation(
      parseInt(userId),
      parseInt(bikerackId),
      hours,
      parseInt(bicycleId)
    );

      await HistoryService.logReservationCreated(reservation);

    await sendEmail(
      reservation.user.email,
      'Reserva Confirmada - Bicicletero UBB',
      emailTemplates.reservationConfirmation(reservation.user, reservation)
    );

    handleSuccess(res, 201, 'Reserva creada exitosamente', {
      reservationCode: reservation.reservationCode,
      spaceCode: reservation.space.spaceCode,
      bikerackName: reservation.space.bikerack.name,
      estimatedHours: reservation.estimatedHours,
      expirationTime: reservation.expirationTime,
    });
  } catch (error) {
    console.error('Error en createReservation:', error.message);

    const businessErrors = [
      'disponibles',
      'ya tiene una reserva',
      'no pertenece',
    ];

    if (
      businessErrors.some((msg) => error.message.toLowerCase().includes(msg))
    ) {
      return handleErrorClient(res, 409, error.message);
    }

    handleErrorServer(res, 500, 'Error interno al crear la reserva');
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! CANCELAR RESERVA
export async function cancelReservationController(req, res) {
  try {
    const { reservationId } = req.params;
    const userId = req.user.id;

    if (!reservationId) {
      return handleErrorClient(res, 400, 'ID de reserva requerido');
    }

    const result = await cancelReservation(parseInt(reservationId), userId);

    await sendEmail(
      result.user.email,
      'Reserva Cancelada - Bicicletero UBB',
      emailTemplates.reservationCancellation(result.user, result.reservation)
    );

    handleSuccess(res, 200, 'Reserva cancelada exitosamente', {
      reservationCode: result.reservation.reservationCode,
      spaceCode: result.space.spaceCode,
    });
  } catch (error) {
    console.error('Error en cancelReservation:', error);

    if (
      error.message.includes('no encontrada') ||
      error.message.includes('no autorizado')
    ) {
      return handleErrorClient(res, 404, error.message);
    }

    handleErrorServer(res, 500, 'Error al cancelar la reserva', error.message);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! OBTENER RESERVAS DE UN USUARIO
export async function getUserReservationsController(req, res) {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      return handleErrorClient(res, 400, 'ID de usuario inválido');
    }

    const reservations = await getUserReservations(parseInt(userId));

    handleSuccess(res, 200, 'Reservas obtenidas exitosamente', reservations);
  } catch (error) {
    console.error('Error en getUserReservations:', error);
    handleErrorServer(res, 500, 'Error al obtener las reservas', error.message);
  }
}
export async function getAvailableSpacesController(req, res) {
  try {
    const summary = await getAvailableSpaces();
    return res.status(200).json(summary);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener espacios disponibles' });
  }
}

export const getCurrentReservation = async (req, res) => {
  try {
    const userId = req.user.id;

    const reservationRepository = AppDataSource.getRepository(ReservationEntity);

    const reservation = await reservationRepository.findOne({
      where: {
        user: { id: userId },
        status: In([
          RESERVATION_STATUS.PENDING,
          RESERVATION_STATUS.ACTIVE,
        ]),
      },
      relations: ['space', 'space.bikerack', 'bicycle'],
      order: {
        created_at: 'DESC',
      },
    });

    if (!reservation) {
      return res.status(200).json(null);
    }

    if (reservation.status === RESERVATION_STATUS.PENDING) {
      const now = new Date();
      const expiration = new Date(reservation.expirationTime);

      if (expiration && now > expiration) {
        reservation.status = RESERVATION_STATUS.EXPIRED;
        await reservationRepository.save(reservation);
        return res.status(200).json(null);
      }
    }

    return res.status(200).json({
      id: reservation.id,
      reservationCode: reservation.reservationCode,
      status: reservation.status,
      expirationTime: reservation.expirationTime,
      estimatedHours: reservation.estimatedHours,
      bikerackId: reservation.space?.bikerack?.id ?? null,
      spaceId: reservation.space?.id,
      spaceCode: reservation.space?.spaceCode,
      bicycle: reservation.bicycle
        ? {
            id: reservation.bicycle.id,
            brand: reservation.bicycle.brand,
            model: reservation.bicycle.model,
          }
        : null,
    });

  } catch (error) {
    console.error('Error obteniendo reserva actual:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};
