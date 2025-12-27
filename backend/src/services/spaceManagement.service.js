import { AppDataSource } from '../config/configDb.js';
import { SPACE_STATUS } from '../entities/SpaceEntity.js';
import { RESERVATION_STATUS } from '../entities/ReservationEntity.js';
import { LOG_ACTIONS, LOG_FINAL_STATUS } from '../entities/SpaceLogEntity.js';
import { generateRetrievalCode } from '../helpers/spaceManagementEmail.helper.js';
import { getActiveSpaceLog } from '../helpers/spaceDetails.helper.js';
import { formatRut } from '../helpers/rut.helper.js';
import { IsNull, LessThan } from 'typeorm';
import { sendEmail } from './email.service.js';
import { emailTemplates } from '../templates/spaceManagementEmail.template.js';

const spaceRepository = AppDataSource.getRepository('Space');
const reservationRepository = AppDataSource.getRepository('Reservation');
const userRepository = AppDataSource.getRepository('User');
const bicycleRepository = AppDataSource.getRepository('Bicycle');
const spaceLogRepository = AppDataSource.getRepository('SpaceLog');
////////////////////////////////////////////////////////////////////////////////////////////
//! OCUPAR ESPACIO CON RESERVA (para que guardia pueda marcar como ocupado un espacio reservado)
export async function occupySpaceWithReservation(reservationCode) {
  try {
    //* para buscar reserva por código
    const reservation = await reservationRepository.findOne({
      where: { reservationCode, status: RESERVATION_STATUS.PENDING },
      relations: ['space', 'space.bikerack', 'user', 'bicycle'],
    });

    if (!reservation) {
      throw new Error('Reserva no encontrada o ya utilizada!');
    }

    const actualCheckin = new Date();
    const estimatedHours = parseInt(reservation.estimatedHours);

    //! CALCULO DE TIEMPOS
    const estimatedCheckout = new Date(
      actualCheckin.getTime() + estimatedHours * 60 * 60 * 1000
    );
    //! se define el inicio de la infracción (+15 minutos)
    const infractionStart = new Date(
      estimatedCheckout.getTime() + 15 * 60 * 1000
    );

    //! SPACELOG CON INFRACTION START
    const spaceLog = spaceLogRepository.create({
      action: LOG_ACTIONS.CHECKIN,
      actualCheckin,
      estimatedCheckout,
      infractionStart,
      space: reservation.space,
      user: reservation.user,
      bicycle: reservation.bicycle,
      reservation: reservation,
    });

    await spaceLogRepository.save(spaceLog);

    //* para actualizar espacio y reserva
    reservation.space.status = SPACE_STATUS.OCCUPIED;
    reservation.status = RESERVATION_STATUS.ACTIVE;

    const retrievalCode = generateRetrievalCode();
    const retrievalCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    reservation.space.currentRetrievalCode = retrievalCode;
    reservation.space.currentRetrievalCodeExpires = retrievalCodeExpires;

    await spaceRepository.save(reservation.space);
    await reservationRepository.save(reservation);

    return {
      success: true,
      space: reservation.space,
      reservation,
      user: reservation.user,
      retrievalCode,
    };
  } catch (error) {
    if (error.message.includes('Reserva no encontrada')) {
      throw error;
    }
    throw new Error(`Error ocupando espacio con reserva: ${error.message}`);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! OCUPAR ESPACIO SIN RESERVA (para que guardia pueda marcar como ocupado manualmente)
export async function occupySpaceWithoutReservation(
  spaceId,
  userRut,
  estimatedHours,
  bicycleId
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

    //* para normalizar el rut y buscar usuario
    const formattedRut = formatRut(userRut);

    const user = await userRepository.findOne({
      where: { rut: formattedRut },
      relations: ['bicycles', 'reservations'],
    });

    if (!user) {
      throw new Error(`Usuario con RUT ${formattedRut} no encontrado`);
    }

    //* solo 1 espacio a la vez por usuario
    const hasActiveProcess = user.reservations?.some(
      (res) =>
        res.status === RESERVATION_STATUS.PENDING ||
        res.status === RESERVATION_STATUS.ACTIVE
    );

    if (hasActiveProcess) {
      throw new Error(
        'El usuario ya tiene una reserva activa o una bicicleta en un bicletero.'
      );
    }

    //* para validar que la bicicleta pertenece al usuario
    const userBicycleIds = user.bicycles.map((bicycle) => bicycle.id);
    if (!userBicycleIds.includes(parseInt(bicycleId))) {
      throw new Error('Bicicleta no pertenece al usuario');
    }

    //* para obtener la bici seleccionada
    const bicycle = await bicycleRepository.findOne({
      where: { id: bicycleId },
    });

    const actualCheckin = new Date();
    const hoursInt = parseInt(estimatedHours);

    //! CALCULO DE TIEMPOS
    const estimatedCheckout = new Date(
      actualCheckin.getTime() + hoursInt * 60 * 60 * 1000
    );
    //! se define el inicio de la infracción (+15 minutos)
    const infractionStart = new Date(
      estimatedCheckout.getTime() + 15 * 60 * 1000
    );

    const reservationCode = `A${Math.floor(1000 + Math.random() * 9000)}`;

    //* se crea una reserva automática
    const reservation = reservationRepository.create({
      reservationCode: reservationCode,
      dateTimeReservation: actualCheckin,
      estimatedHours: estimatedHours,
      expirationTime: null,
      status: RESERVATION_STATUS.ACTIVE,
      space: space,
      user: user,
      bicycle: bicycle,
    });

    await reservationRepository.save(reservation);

    //! CREAR SPACELOG CON INFRACTION START
    const spaceLog = spaceLogRepository.create({
      action: LOG_ACTIONS.CHECKIN,
      actualCheckin,
      estimatedCheckout,
      infractionStart,
      space: space,
      user: user,
      bicycle: bicycle,
      reservation: reservation,
    });

    await spaceLogRepository.save(spaceLog);

    //! ACTUALIZAR ESPACIO CON CURRENTLOG
    space.status = SPACE_STATUS.OCCUPIED;

    const retrievalCode = generateRetrievalCode();
    const retrievalCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    space.currentRetrievalCode = retrievalCode;
    space.currentRetrievalCodeExpires = retrievalCodeExpires;

    await spaceRepository.save(space);

    return {
      success: true,
      space,
      reservation,
      user,
      retrievalCode,
    };
  } catch (error) {
    const businessErrors = [
      'Espacio no disponible',
      'no encontrado',
      'ya tiene una reserva',
      'no pertenece al usuario',
    ];

    if (
      businessErrors.some((msg) =>
        error.message.toLowerCase().includes(msg.toLowerCase())
      )
    ) {
      throw error;
    }

    throw new Error(`Error ocupando espacio sin reserva: ${error.message}`);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! LIBERAR ESPACIO (para retiro normal y con infracción)
export async function liberateSpace(spaceId, retrievalCode) {
  try {
    //* para verificar que el espacio esté ocupado/en infracción
    const space = await spaceRepository.findOne({
      where: [
        { id: spaceId, status: SPACE_STATUS.OCCUPIED },
        { id: spaceId, status: SPACE_STATUS.TIME_EXCEEDED },
      ],
      relations: ['bikerack', 'spaceLogs', 'spaceLogs.user'],
    });

    if (!space) {
      throw new Error('Espacio no encontrado o no está ocupado/en infracción');
    }

    if (!retrievalCode) throw new Error('Código de retiro requerido');
    if (space.currentRetrievalCode !== retrievalCode)
      throw new Error('Código de retiro incorrecto');
    if (space.currentRetrievalCodeExpires < new Date())
      throw new Error('Código de retiro expirado');

    const activeLog = getActiveSpaceLog(space.spaceLogs);
    if (!activeLog)
      throw new Error('No se encontró registro activo para este espacio');

    //* para verificar que existe una reserva ACTIVA para ese espacio
    const reservation = await reservationRepository.findOne({
      where: { space: { id: spaceId }, status: RESERVATION_STATUS.ACTIVE },
      relations: ['user'],
    });

    const now = new Date();
    let totalInfractionMinutes = 0;
    let isInfraction = false;

    if (
      activeLog.infractionStart &&
      now > new Date(activeLog.infractionStart)
    ) {
      const infractionMs = now - new Date(activeLog.infractionStart);
      totalInfractionMinutes = Math.max(
        Math.floor(infractionMs / (1000 * 60)),
        0
      );
      isInfraction = true;
    }

    //* actualizar log
    activeLog.actualCheckout = now;
    activeLog.action = LOG_ACTIONS.CHECKOUT;
    activeLog.totalInfractionMinutes = totalInfractionMinutes;
    activeLog.finalStatus = isInfraction
      ? LOG_FINAL_STATUS.TIME_EXCEEDED
      : LOG_FINAL_STATUS.COMPLETED;
    await spaceLogRepository.save(activeLog);

    //* para actualizar espacio a libre (limpiar el espacio)
    space.status = SPACE_STATUS.FREE;
    space.currentRetrievalCode = null;
    space.currentRetrievalCodeExpires = null;
    await spaceRepository.save(space);

    if (reservation) {
      reservation.status = RESERVATION_STATUS.COMPLETED;
      await reservationRepository.save(reservation);
    }

    return {
      success: true,
      isInfraction,
      infractionDuration: totalInfractionMinutes,
      space,
      user: activeLog.user || reservation?.user,
    };
  } catch (error) {
    const businessErrors = [
      'Espacio no encontrado',
      'Código de retiro incorrecto',
      'Código de retiro expirado',
    ];
    if (businessErrors.some((msg) => error.message.includes(msg))) {
      throw error;
    }
    throw new Error(`Error en el proceso de liberación: ${error.message}`);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! VERIFICAR Y ACTUALIZAR ESPACIOS EN INFRACCIÓN (este lo usa el job, no el controller)
export async function checkTimeExceededSpaces() {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const now = new Date();

    const logsInViolation = await queryRunner.manager.find('SpaceLog', {
      where: {
        action: LOG_ACTIONS.CHECKIN,
        actualCheckout: null,
        finalStatus: IsNull(),
        infractionStart: LessThan(now),
      },
      relations: ['user', 'space', 'space.bikerack'],
    });

    for (const log of logsInViolation) {
      log.finalStatus = LOG_FINAL_STATUS.TIME_EXCEEDED;
      await queryRunner.manager.save('SpaceLog', log);

      if (log.space) {
        log.space.status = SPACE_STATUS.TIME_EXCEEDED;
        await queryRunner.manager.save('Space', log.space);
      }

      if (log.user?.email) {
        const emailHtml = emailTemplates.timeExceeded(
          log.user,
          log.space,
          log.infractionStart
        );

        await sendEmail(
          log.user.email,
          'Alerta: Tiempo de uso excedido - UBB',
          null,
          emailHtml
        );
      }
    }

    await queryRunner.commitTransaction();
    return logsInViolation.length;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error en checkTimeExceededSpaces:', error);
    return 0;
  } finally {
    await queryRunner.release();
  }
}
