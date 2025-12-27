'use strict';
import {
  getUserBicycles,
  createAutomaticReservation,
  cancelReservation,
  getUserReservations,
} from '../services/reservation.service.js';
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from '../Handlers/responseHandlers.js';
import { sendEmail } from '../services/email.service.js';
import { emailTemplates } from '../templates/reservationEmail.template.js';
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
    const { userId, bikerackId, estimatedHours, bicycleId } = req.body;

    if (!userId || !bikerackId || !estimatedHours || !bicycleId) {
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
    const { userId } = req.body;

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