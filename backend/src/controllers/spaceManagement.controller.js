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
//! MARCAR OCUPADO - CON RESERVA
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
      emailTemplates.checkinStandard(result.user, result.space, {
        reservationCode: result.reservation.reservationCode,
        estimatedHours: result.reservation.estimatedHours,
        retrievalCode: result.retrievalCode,
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
//! MARCAR OCUPADO - SIN RESERVA
export async function occupyWithoutReservation(req, res) {
  try {
    const { spaceId } = req.params;
    const { rut, estimatedHours, bicycleId } = req.body;

    if (!spaceId || isNaN(parseInt(spaceId))) {
      return handleErrorClient(res, 400, 'ID de espacio inválido');
    }
    if (!rut || !estimatedHours || !bicycleId) {
      return handleErrorClient(
        res,
        400,
        'Faltan campos obligatorios: rut, estimatedHours o bicycleId'
      );
    }
    const hours = parseFloat(estimatedHours);
    if (isNaN(hours) || hours <= 0) {
      return handleErrorClient(
        res,
        400,
        'Las horas estimadas deben ser un número válido mayor a 0'
      );
    }
    if (isNaN(parseInt(bicycleId))) {
      return handleErrorClient(
        res,
        400,
        'El ID de la bicicleta debe ser un número'
      );
    }

    const result = await occupySpaceWithoutReservation(
      parseInt(spaceId),
      rut,
      hours,
      parseInt(bicycleId)
    );

    await sendEmail(
      result.user.email,
      'Ingreso Confirmado - Bicicletero UBB',
      emailTemplates.checkinStandard(result.user, result.space, {
        retrievalCode: result.retrievalCode,
        estimatedHours: estimatedHours,
      })
    );

    handleSuccess(res, 200, 'Espacio ocupado exitosamente sin reserva', result);
  } catch (error) {
    console.error('Error en occupyWithoutReservation:', error.message);
    handleErrorClient(res, 400, error.message);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! LIBERAR ESPACIO (para retiro normal y con infracción)
export async function liberateSpaceController(req, res) {
  try {
    const { spaceId } = req.params;
    const { retrievalCode } = req.body;

    if (!spaceId || isNaN(parseInt(spaceId))) {
      return handleErrorClient(res, 400, 'ID de espacio inválido');
    }
    if (!retrievalCode) {
      return handleErrorClient(res, 400, 'El código de retiro es obligatorio');
    }

    const result = await liberateSpace(parseInt(spaceId), retrievalCode);

    let emailHtml;
    let subject;

    if (result.isInfraction) {
      subject = 'Retiro con Infracción - Bicicletero UBB';
      emailHtml = emailTemplates.infractionCheckout(
        result.user,
        result.space,
        result.infractionDuration
      );
    } else {
      subject = 'Retiro Confirmado - Bicicletero UBB';
      emailHtml = emailTemplates.checkoutStandard(result.user, result.space);
    }

    if (result.user?.email) {
      await sendEmail(result.user.email, subject, emailHtml);
    }

    handleSuccess(res, 200, 'Espacio liberado exitosamente', result);
  } catch (error) {
    console.error('Error en liberateSpaceController:', error.message);

    if (
      error.message.includes('Error obteniendo') ||
      error.message.includes('Database')
    ) {
      return handleErrorServer(
        res,
        500,
        'Error interno al procesar la liberación'
      );
    }

    handleErrorClient(res, 400, error.message);
  }
}
