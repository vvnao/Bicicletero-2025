import { SPACE_STATUS } from '../entities/SpaceEntity.js';

//! FORMATEAR DATOS DEL ESPACIO SGN ESTADO
export function formatSpaceData(space) {
  const baseData = {
    id: space.id,
    spaceCode: space.spaceCode,
    status: space.status,
    bikerackName: space.bikerack?.name || 'Bicicletero',
  };

  switch (space.status) {
    case SPACE_STATUS.OCCUPIED:
      return {
        ...baseData,
        user: formatUserData(space.currentLog?.user),
        bicycle: formatBicycleData(space.currentLog?.bicycle),
        arrivalTime: space.currentLog?.actualCheckin || null,
        estimatedDeparture: space.currentLog?.estimatedCheckout || null,
        hasInfraction: checkIfHasInfraction(space.currentLog),
      };

    case SPACE_STATUS.RESERVED:
      const activeReservation = space.reservations?.find(
        (res) => res.status === 'Pendiente' || res.status === 'Activa'
      );
      return {
        ...baseData,
        user: formatUserData(activeReservation?.user),
        bicycle: formatBicycleData(activeReservation?.bicycle),
        reservationCode: activeReservation?.reservationCode || null,
        expirationTime: activeReservation?.expirationTime || null,
      };

    case SPACE_STATUS.TIME_EXCEEDED:
      return {
        ...baseData,
        user: formatUserData(space.currentLog?.user),
        bicycle: formatBicycleData(space.currentLog?.bicycle),
        arrivalTime: space.currentLog?.actualCheckin || null,
        estimatedDeparture: space.currentLog?.estimatedCheckout || null,
        infractionDuration: space.currentLog?.infractionDuration || 0,
        infractionStart: space.currentLog?.infractionStart || null,
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
  return spaceLog.infractionDuration > 0 || spaceLog.infractionStart !== null;
}
