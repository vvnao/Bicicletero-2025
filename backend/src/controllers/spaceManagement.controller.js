import {
  occupySpaceWithReservation,
  occupySpaceWithoutReservation,
  liberateSpace,
} from '../services/spaceManagement.service.js';
import HistoryService from '../services/history.service.js';
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

    await HistoryService.logEvent({
      historyType: 'user_checkin',
      description: `Usuario ${result.user.names} ingresó al bicicletero ${result.space.bikerack.name} con reserva`,
      details: {
        userId: result.user.id,
        userName: `${result.user.names} ${result.user.lastName}`,
        userEmail: result.user.email,
        spaceId: result.space.id,
        spaceCode: result.space.spaceCode,
        bikerackId: result.space.bikerack.id,
        bikerackName: result.space.bikerack.name,
        reservationId: result.reservation?.id,
        reservationCode: result.reservation?.reservationCode,
        bicycleId: result.reservation?.bicycleId,
        retrievalCode: result.retrievalCode,
        estimatedHours: result.reservation?.estimatedHours,
        guardId: req.user?.id || null,
        timestamp: new Date().toISOString()
      },
      userId: result.user.id,
      guardId: req.user?.id || null,
      spaceId: result.space.id,
      bikerackId: result.space.bikerack.id,
      reservationId: result.reservation?.id,
      bicycleId: result.reservation?.bicycleId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

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

    // *🟢 CHECK-IN EN HISTORIAL
    await HistoryService.logEvent({
      historyType: 'user_checkin',
      description: `Usuario ${result.user.names} ingresó al bicicletero ${result.space.bikerack.name} sin reserva`,
      details: {
        userId: result.user.id,
        userName: `${result.user.names} ${result.user.lastName}`,
        userEmail: result.user.email,
        spaceId: result.space.id,
        spaceCode: result.space.spaceCode,
        bikerackId: result.space.bikerack.id,
        bikerackName: result.space.bikerack.name,
        reservationId: result.reservation?.id,
        reservationCode: result.reservation?.reservationCode,
        bicycleId: parseInt(bicycleId),
        retrievalCode: result.retrievalCode,
        estimatedHours: hours,
        guardId: req.user?.id || null,
        timestamp: new Date().toISOString()
      },
      userId: result.user.id,
      guardId: req.user?.id || null,
      spaceId: result.space.id,
      bikerackId: result.space.bikerack.id,
      reservationId: result.reservation?.id,
      bicycleId: parseInt(bicycleId),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

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

      const historyType = result.isInfraction ? 'infraction' : 'user_checkout';
    const description = result.isInfraction 
      ? `Usuario ${result.user.names} retiró con infracción (${result.infractionDuration}h extra)`
      : `Usuario ${result.user.names} retiró del bicicletero ${result.space.bikerack.name}`;
    
    await HistoryService.logEvent({
      historyType: historyType,
      description: description,
      details: {
        userId: result.user.id,
        userName: `${result.user.names} ${result.user.lastName}`,
        userEmail: result.user.email,
        spaceId: result.space.id,
        spaceCode: result.space.spaceCode,
        bikerackId: result.space.bikerack.id,
        bikerackName: result.space.bikerack.name,
        isInfraction: result.isInfraction,
        infractionDuration: result.infractionDuration,
        guardId: req.user?.id || null,
        timestamp: new Date().toISOString()
      },
      userId: result.user.id,
      guardId: req.user?.id || null,
      spaceId: result.space.id,
      bikerackId: result.space.bikerack.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

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
