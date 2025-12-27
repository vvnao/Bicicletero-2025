import { SPACE_STATUS } from '../entities/SpaceEntity.js';
import { LOG_ACTIONS } from '../entities/SpaceLogEntity.js';
import { RESERVATION_STATUS } from '../entities/ReservationEntity.js';
//////////////////////////////////////////////////////////////////////////////////////////////////
//! OBTENER EL LOG ACTIVO (checkin sin checkout)
export function getActiveSpaceLog(spaceLogs, spaceStatus) {
  if (!spaceLogs || spaceLogs.length === 0) return null;

  if (spaceStatus === SPACE_STATUS.RESERVED) {
    const checkinLogs = spaceLogs.filter(
      (log) => log.action === LOG_ACTIONS.CHECKIN && !log.actualCheckout
    );
    return checkinLogs.length > 0
      ? checkinLogs.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )[0]
      : null;
  }

  const activeLogs = spaceLogs.filter(
    (log) => log.actualCheckin && !log.actualCheckout
  );

  return activeLogs.length > 0
    ? activeLogs.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0]
    : null;
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//! FORMATEAR DATOS DEL ESPACIO SEGÚN ESTADO
export function formatSpaceData(space) {
  const activeLog = getActiveSpaceLog(space.spaceLogs, space.status);

  const baseData = {
    id: space.id,
    spaceCode: space.spaceCode,
    status: space.status,
    bikerackName: space.bikerack?.name || 'Bicicletero',
    currentLog: activeLog,
  };

  switch (space.status) {
    case SPACE_STATUS.OCCUPIED:
      return {
        ...baseData,
        user: formatUserData(activeLog?.user),
        bicycle: formatBicycleData(activeLog?.bicycle),
        arrivalTime: activeLog?.actualCheckin || null,
        estimatedDeparture: activeLog?.estimatedCheckout || null,
        hasInfraction: checkIfHasInfraction(activeLog),
      };

    case SPACE_STATUS.RESERVED:
      const activeReservation = space.reservations?.find(
        (res) =>
          res.status === RESERVATION_STATUS.PENDING ||
          res.status === RESERVATION_STATUS.ACTIVE
      );
      return {
        ...baseData,
        user: formatUserData(activeReservation?.user),
        bicycle: formatBicycleData(activeReservation?.bicycle),
        reservationCode: activeReservation?.reservationCode || null,
        expirationTime: activeReservation?.expirationTime || null,
      };

    case SPACE_STATUS.TIME_EXCEEDED:
      //* se calcula la duración del tiempo en infracción para que el guardia vea el tiempo real
      const now = new Date();
      const diffMs = activeLog?.infractionStart
        ? now - new Date(activeLog.infractionStart)
        : 0;
      const currentInfractionMinutes = Math.max(
        Math.floor(diffMs / (1000 * 60)),
        0
      );

      return {
        ...baseData,
        user: formatUserData(activeLog?.user),
        bicycle: formatBicycleData(activeLog?.bicycle),
        arrivalTime: activeLog?.actualCheckin || null,
        estimatedDeparture: activeLog?.estimatedCheckout || null,
        //* se envía el cálculo (no se guarda en la bd)
        infractionDuration: currentInfractionMinutes,
        infractionStart: activeLog?.infractionStart || null,
        totalInfractionMinutes: activeLog?.totalInfractionMinutes || 0,
      };

    case SPACE_STATUS.FREE:
    default:
      return baseData;
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//! FORMATEAR DATOS DE USUARIO
export function formatUserData(user) {
  if (!user) return null;

  return {
    id: user.id,
    names: user.names,
    lastName: user.lastName,
    rut: user.rut,
    email: user.email,
    typePerson: user.typePerson,
  };
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//! FORMATEAR DATOS DE BICICLETA
export function formatBicycleData(bicycle) {
  if (!bicycle) return null;

  return {
    id: bicycle.id,
    brand: bicycle.brand || 'No especificada',
    model: bicycle.model || 'No especificado',
    color: bicycle.color || 'No especificado',
    photo: bicycle.photo || null,
    serialNumber: bicycle.serialNumber || null,
  };
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//! para verificar si tiene infracción
export function checkIfHasInfraction(spaceLog) {
  if (!spaceLog) return false;
  return spaceLog.infractionStart !== null;
}
