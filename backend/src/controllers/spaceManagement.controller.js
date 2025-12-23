import {
  occupySpaceWithReservation,
  occupySpaceWithoutReservation,
  liberateSpace,
} from '../services/spaceManagement.service.js';
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from '../Handlers/responseHandlers.js';
import { sendEmail } from '../services/email.service.js';
import { emailTemplates } from '../templates/spaceManagementEmail.template.js';
////////////////////////////////////////////////////////////////////////////////////////////
//! MARCAR OCUPADO CON RESERVA
export async function occupyWithReservation(req, res) {
  try {
    const { reservationCode } = req.body;

    if (!reservationCode) {
      return handleErrorClient(res, 400, 'Código de reserva requerido');
    }

    const result = await occupySpaceWithReservation(reservationCode);

    await sendEmail(
      result.user.email,
      'Ingreso Confirmado - Bicicletero UBB',
      `Tu bicicleta está en espacio ${result.space.spaceCode}`,
      emailTemplates.checkinStandard(result.user, result.space, {
        reservationCode: result.reservation.reservationCode,
        estimatedHours: result.reservation.estimatedHours,
      })
    );
    console.log('Correo enviado');

    handleSuccess(res, 200, 'Espacio ocupado exitosamente con reserva', result);
  } catch (error) {
    console.error('Error en occupyWithReservation:', error);
    handleErrorClient(res, 400, error.message);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! MARCAR OCUPADO SIN RESERVA
export async function occupyWithoutReservation(req, res) {
  try {
    const { spaceId } = req.params;
    const { rut, estimatedHours } = req.body;

    if (!spaceId || !rut || !estimatedHours) {
      return handleErrorClient(
        res,
        400,
        'SpaceId, rut y estimatedHours requeridos'
      );
    }

    const result = await occupySpaceWithoutReservation(
      parseInt(spaceId),
      rut,
      parseInt(estimatedHours)
    );

    await sendEmail(
      result.user.email,
      'Ingreso Confirmado - Bicicletero UBB',
      `Tu bicicleta está en espacio ${result.space.spaceCode}`,
      emailTemplates.checkinStandard(result.user, result.space, {
        estimatedHours: estimatedHours,
      })
    );
    console.log('Correo enviado');

    handleSuccess(res, 200, 'Espacio ocupado exitosamente sin reserva', result);
  } catch (error) {
    console.error('Error en occupyWithoutReservation:', error);
    handleErrorClient(res, 400, error.message);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! LIBERAR ESPACIO
export async function liberateSpaceController(req, res) {
  try {
    const { spaceId } = req.params;

    if (!spaceId) {
      return handleErrorClient(res, 400, 'SpaceId requerido');
    }

    const result = await liberateSpace(parseInt(spaceId));

    await sendEmail(
      result.user.email,
      'Retiro Confirmado - Bicicletero UBB',
      `Retiraste tu bicicleta del espacio ${result.space.spaceCode}`,
      emailTemplates.checkout(result.user, result.space, result.reservation)
    );
    console.log('Correo enviado');

    handleSuccess(res, 200, 'Espacio liberado exitosamente', result);
  } catch (error) {
    console.error('Error en liberateSpace:', error);
    handleErrorClient(res, 400, error.message);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! MARCAR COMO TIEMPO EXCEDIDO
export async function markAsOverdue(req, res) {
  try {
    const { spaceId } = req.params;

    if (!spaceId) {
      return handleErrorClient(res, 400, 'SpaceId requerido');
    }

    const result = await markSpaceAsOverdue(parseInt(spaceId));

    await sendEmail(
      result.user.email,
      '⚠️ Tiempo Excedido - Bicicletero UBB',
      `Tu bicicleta ha excedido el tiempo de estacionamiento`,
      emailTemplates.timeExceeded(
        result.user,
        result.space,
        result.infractionDuration
      )
    );
    console.log('Correo enviado');

    handleSuccess(res, 200, 'Espacio marcado como tiempo excedido', result);
  } catch (error) {
    console.error('Error en markAsOverdue:', error);
    handleErrorClient(res, 400, error.message);
  }
}
