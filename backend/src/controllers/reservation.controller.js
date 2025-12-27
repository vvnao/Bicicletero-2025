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
export async function getUserBicyclesForReservation(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return handleErrorClient(res, 400, 'ID de usuario no proporcionado en la petición');
        }

        const bicycles = await getUserBicycles(userId);

        return handleSuccess(res, 200, 'Bicicletas obtenidas exitosamente', bicycles);

    } catch (error) {
        if (error.message === 'Usuario no encontrado' || error.statusCode === 404) {
            return handleErrorClient(res, 404, error.message);
        }
        return handleErrorServer(res, 500, 'Error inesperado al procesar la solicitud');
    }
}
export async function createReservation(req, res) {
  try {
    const userId = req.user?.id; 
    const { bikerackId, estimatedHours, bicycleId } = req.body;

    if (!userId) return handleErrorClient(res, 401, 'Usuario no autenticado');
    if (!bikerackId || !estimatedHours || !bicycleId) {
      return handleErrorClient(res, 400, 'Faltan campos obligatorios');
    }

    const hours = parseFloat(estimatedHours);
    if (isNaN(hours) || hours < 1 || hours > 24) {
      return handleErrorClient(res, 400, 'Las horas deben ser un número entre 1 y 24');
    }

    const reservation = await createAutomaticReservation(userId,parseInt(bikerackId),hours,parseInt(bicycleId));

    try {
      await sendEmail(
        reservation.user.email,
        'Reserva Confirmada - Bicicletero UBB',
        `Tu reserva está confirmada para el espacio ${reservation.space.spaceCode}`,
        emailTemplates.reservationConfirmation(reservation.user, reservation)
      );
    } catch (mailError) {
      console.error('Error enviando email:', mailError.message);
    }

    handleSuccess(res, 201, 'Reserva creada exitosamente', {
      reservationCode: reservation.reservationCode,
      spaceCode: reservation.space.spaceCode,
      bikerackName: reservation.space.bikerack.name,
      estimatedHours: reservation.estimatedHours,
      expirationTime: reservation.expirationTime,
    });
  } catch (error) {
    console.error('Error en createReservation:', error.message);

    const businessErrors = ['disponibles', 'ya tiene una reserva', 'no pertenece', 'no encontrado'];
    if (businessErrors.some((msg) => error.message.toLowerCase().includes(msg))) {
      return handleErrorClient(res, 409, error.message);
    }

    handleErrorServer(res, 500, 'Error interno al crear la reserva');
  }
}
export async function cancelReservationController(req, res) {
  try {
    const userId = req.user?.id;
    const { reservationId } = req.params;

    if (!userId) return handleErrorClient(res, 401, 'Usuario no identificado');

    const result = await cancelReservation(parseInt(reservationId), userId);

    sendEmail(
      result.user.email,
      'Reserva Cancelada - Bicicletero UBB',
      'Tu reserva ha sido cancelada',
      emailTemplates.reservationCancellation(result.user, result.reservation)
    ).catch(err => console.error('Error email:', err.message));

    return handleSuccess(res, 200, 'Reserva cancelada exitosamente', {
      reservationCode: result.reservation.reservationCode,
      spaceCode: result.space.spaceCode,
    });

  } catch (error) {
    const businessErrors = ['no encontrada', 'autorizado', 'pendiente'];
    if (businessErrors.some(msg => error.message.toLowerCase().includes(msg))) {
      return handleErrorClient(res, 400, error.message);
    }
    return handleErrorServer(res, 500, 'Error al procesar la cancelación en el servidor');
  }
}
export async function getUserReservationsController(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) return handleErrorClient(res, 401, 'Usuario no identificado');

    console.log(`Obteniendo reservas del usuario ID: ${userId}`);

    const reservations = await getUserReservations(userId);

    handleSuccess(res, 200, 'Reservas obtenidas exitosamente', reservations);
  } catch (error) {
    console.error('Error en getUserReservations:', error);
    handleErrorServer(res, 500, 'Error al obtener las reservas', error.message);
  }
}