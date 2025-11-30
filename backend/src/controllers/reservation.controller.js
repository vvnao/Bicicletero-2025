'use strict';
import { createAutomaticReservation, cancelReservation, getUserReservations } from '../services/reservation.service.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../Handlers/responseHandlers.js';
import { sendEmail } from '../services/email.service.js';
import { emailTemplates } from '../templates/reservationEmail.template.js';
import { getUserBicycles } from '../services/reservation.service.js';
////////////////////////////////////////////////////////////////////////////////////////////
//! OBTENER LAS BICIS DEL USUARIO PARA QUE PUEDA SELECCIONAR 1 EN LA RESERVA
export async function getUserBicyclesForReservation(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return handleErrorClient(res, 400, 'ID de usuario requerido');
    }

    const bicycles = await getUserBicycles(parseInt(userId));

    handleSuccess(res, 200, 'Bicicletas obtenidas exitosamente', bicycles);
  } catch (error) {
    console.error('Error en getUserBicyclesForReservation:', error);
    handleErrorServer(
      res,
      500,
      'Error al obtener las bicicletas',
      error.message
    );
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! CREAR RESERVA AUTOMÁTICA
export async function createReservation(req, res) {
  try {
    const { userId, bikerackId, estimatedHours, bicycleId } = req.body;

    if (!userId || !bikerackId || !estimatedHours || !bicycleId) {
      return handleErrorClient(res, 400, 'Todos los campos son requeridos: userId, bikerackId, estimatedHours, bicycleId');
    }

    if (estimatedHours < 1 || estimatedHours > 24) {
      return handleErrorClient(res, 400, 'Las horas estimadas deben estar entre 1 y 24 horas');
    }

    console.log(`Creando reserva para usuario ${userId} en bicicletero ${bikerackId}`);

    const reservation = await createAutomaticReservation(userId, bikerackId, estimatedHours, bicycleId);

    await sendEmail(
      reservation.user.email,
      'Reserva Confirmada - Bicicletero UBB',
      `Tu reserva está confirmada para el espacio ${reservation.space.spaceCode}`,
      emailTemplates.reservationConfirmation(reservation.user, reservation)
    );

    handleSuccess(res, 201, 'Reserva creada exitosamente', {
      reservationCode: reservation.reservationCode,
      spaceCode: reservation.space.spaceCode,
      bikerackName: reservation.space.bikerack.name,
      estimatedHours: reservation.estimatedHours,
      expirationTime: reservation.expirationTime
    });

  } catch (error) {
    console.error('Error en createReservation:', error);
    
    if (error.message.includes('No hay espacios disponibles')) {
      return handleErrorClient(res, 409, 'No hay espacios disponibles en este bicicletero');
    }
    
    handleErrorServer(res, 500, 'Error al crear la reserva', error.message);
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

    console.log(`Cancelando reserva ID: ${reservationId}`);

    const result = await cancelReservation(parseInt(reservationId), userId);

    await sendEmail(
      result.user.email,
      'Reserva Cancelada - Bicicletero UBB',
      'Tu reserva ha sido cancelada',
      emailTemplates.reservationCancellation(result.user, result.reservation)
    );

    handleSuccess(res, 200, 'Reserva cancelada exitosamente', {
      reservationCode: result.reservation.reservationCode,
      spaceCode: result.space.spaceCode,
    });
  } catch (error) {
    console.error('Error en cancelReservation:', error);
    
    if (error.message.includes('no encontrada') || error.message.includes('no autorizado')) {
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

    if (!userId) {
      return handleErrorClient(res, 400, 'ID de usuario requerido');
    }

    console.log(`Obteniendo reservas del usuario ID: ${userId}`);

    const reservations = await getUserReservations(parseInt(userId));

    handleSuccess(res, 200, 'Reservas obtenidas exitosamente', reservations);

  } catch (error) {
    console.error('Error en getUserReservations:', error);
    handleErrorServer(res, 500, 'Error al obtener las reservas', error.message);
  }
}
