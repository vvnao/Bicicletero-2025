import { AppDataSource } from '../config/configDb.js';
import { SPACE_STATUS } from '../entities/SpaceEntity.js';
import { RESERVATION_STATUS } from '../entities/ReservationEntity.js';
import HistoryService from './history.service.js';

const spaceRepository = AppDataSource.getRepository('Space');
const reservationRepository = AppDataSource.getRepository('Reservation');
const userRepository = AppDataSource.getRepository('User');

// Función auxiliar para obtener info del request
function getRequestInfo(req) {
    try {
        return {
            ipAddress: req.ip || 
                      req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.connection?.remoteAddress || 
                      '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'Desconocido'
        };
    } catch (error) {
        return {
            ipAddress: '127.0.0.1',
            userAgent: 'Desconocido'
        };
    }
}

//! OCUPAR ESPACIO CON RESERVA
export async function occupySpaceWithReservation(reservationCode, req = null) {
  try {
    console.log(`🔍 Buscando reserva con código: ${reservationCode}`);
    
    const reservation = await reservationRepository.findOne({
      where: { reservationCode, status: RESERVATION_STATUS.PENDING },
      relations: ['space', 'space.bikerack', 'user', 'bicycle'],
    });

    if (!reservation) {
      throw new Error('Reserva no encontrada o ya utilizada!');
    }

    console.log(`✅ Reserva encontrada para usuario: ${reservation.user.names}`);

    // Actualizar espacio y reserva
    reservation.space.status = SPACE_STATUS.OCCUPIED;
    reservation.status = RESERVATION_STATUS.ACTIVE;
    reservation.dateTimeActualArrival = new Date();

    await spaceRepository.save(reservation.space);
    await reservationRepository.save(reservation);

    // Registrar en historial unificado
    if (req) {
      const requestInfo = getRequestInfo(req);
      try {
        await HistoryService.logUserCheckIn({
          userId: reservation.user.id,
          bicycleId: reservation.bicycle?.id,
          bikerackId: reservation.space.bikerack.id,
          spaceId: reservation.space.id,
          spaceCode: reservation.space.spaceCode,
          bikerackName: reservation.space.bikerack.name,
          estimatedHours: reservation.estimatedHours,
          withReservation: true,
          reservationId: reservation.id,
          reservationCode: reservation.reservationCode,
          guardId: req.user?.id,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent
        });
        console.log('✅ Check-in registrado en historial');
      } catch (historyError) {
        console.error('⚠️ Error registrando en historial:', historyError.message);
      }
    }

    return {
      success: true,
      space: reservation.space,
      reservation,
      user: reservation.user,
    };
  } catch (error) {
    console.error('❌ Error en occupySpaceWithReservation:', error);
    throw new Error(`Error ocupando espacio con reserva: ${error.message}`);
  }
}

//! OCUPAR ESPACIO SIN RESERVA
export async function occupySpaceWithoutReservation(
  spaceId,
  userRut,
  estimatedHours,
  req = null,
  bicycleId = null
) {
  try {
    console.log(`🔍 Ocupando espacio ${spaceId} sin reserva para RUT: ${userRut}`);
    
    const space = await spaceRepository.findOne({
      where: { id: spaceId, status: SPACE_STATUS.FREE },
      relations: ['bikerack'],
    });

    if (!space) {
      throw new Error('Espacio no disponible');
    }

    const user = await userRepository.findOne({
      where: { rut: userRut },
      relations: ['bicycles'],
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Seleccionar bicicleta
    let selectedBicycle = null;
    if (bicycleId) {
      selectedBicycle = user.bicycles.find(b => b.id === parseInt(bicycleId));
      if (!selectedBicycle) {
        throw new Error('La bicicleta no pertenece al usuario');
      }
    } else if (user.bicycles.length > 0) {
      selectedBicycle = user.bicycles[0];
    }

    // Crear reserva automática
    const reservationCode = `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const reservation = reservationRepository.create({
      reservationCode,
      dateTimeReservation: new Date(),
      dateTimeActualArrival: new Date(),
      estimatedHours: estimatedHours,
      status: RESERVATION_STATUS.ACTIVE,
      space: space,
      user: user,
      bicycle: selectedBicycle || null,
    });

    // Actualizar espacio
    space.status = SPACE_STATUS.OCCUPIED;

    await reservationRepository.save(reservation);
    await spaceRepository.save(space);

    console.log(`✅ Espacio ${space.spaceCode} ocupado sin reserva`);

    // Registrar en historial
    if (req) {
      const requestInfo = getRequestInfo(req);
      try {
        await HistoryService.logUserCheckIn({
          userId: user.id,
          bicycleId: selectedBicycle?.id,
          bikerackId: space.bikerack.id,
          spaceId: space.id,
          spaceCode: space.spaceCode,
          bikerackName: space.bikerack.name,
          estimatedHours: estimatedHours,
          withReservation: false,
          reservationId: reservation.id,
          reservationCode: reservation.reservationCode,
          guardId: req.user?.id,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent
        });
        console.log('✅ Check-in sin reserva registrado en historial');
      } catch (historyError) {
        console.error('⚠️ Error registrando en historial:', historyError.message);
      }
    }

    return {
      success: true,
      space,
      reservation,
      user,
      bicycle: selectedBicycle,
      bicycles: user.bicycles,
    };
  } catch (error) {
    console.error('❌ Error en occupySpaceWithoutReservation:', error);
    throw new Error(`Error ocupando espacio sin reserva: ${error.message}`);
  }
}

//! LIBERAR ESPACIO
export async function liberateSpace(spaceId, req = null) {
  try {
    console.log(`🔍 Liberando espacio ID: ${spaceId}`);
    
    const space = await spaceRepository.findOne({
      where: { id: spaceId, status: SPACE_STATUS.OCCUPIED },
      relations: ['bikerack'],
    });

    if (!space) {
      throw new Error('Espacio no encontrado o no está ocupado');
    }

    const reservation = await reservationRepository.findOne({
      where: { space: { id: spaceId }, status: RESERVATION_STATUS.ACTIVE },
      relations: ['user', 'bicycle'],
    });

    // Calcular horas reales
    let actualHours = null;
    if (reservation && reservation.dateTimeActualArrival) {
      const arrival = new Date(reservation.dateTimeActualArrival);
      const departure = new Date();
      const diffMs = departure - arrival;
      actualHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    }

    // Actualizar espacio
    space.status = SPACE_STATUS.FREE;

    // Actualizar reserva si existe
    if (reservation) {
      reservation.status = RESERVATION_STATUS.COMPLETED;
      reservation.dateTimeActualDeparture = new Date();
      await reservationRepository.save(reservation);
    }

    await spaceRepository.save(space);
    console.log(`✅ Espacio ${space.spaceCode} liberado`);

    // Registrar en historial
    if (reservation && req) {
      const requestInfo = getRequestInfo(req);
      try {
        await HistoryService.logUserCheckOut({
          userId: reservation.user.id,
          bicycleId: reservation.bicycle?.id,
          bikerackId: space.bikerack.id,
          spaceId: space.id,
          spaceCode: space.spaceCode,
          bikerackName: space.bikerack.name,
          actualHours: actualHours,
          status: 'completado',
          reservationId: reservation.id,
          reservationCode: reservation.reservationCode,
          guardId: req.user?.id,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent
        });
        console.log('✅ Check-out registrado en historial');
      } catch (historyError) {
        console.error('⚠️ Error registrando check-out en historial:', historyError.message);
      }
    }

    return {
      success: true,
      space,
      reservation: reservation || null,
      user: reservation?.user || null,
      actualHours
    };
  } catch (error) {
    console.error('❌ Error en liberateSpace:', error);
    throw new Error(`Error liberando espacio: ${error.message}`);
  }
}

//! MARCAR COMO TIEMPO EXCEDIDO
export async function markSpaceAsOverdue(spaceId, req = null) {
  try {
    console.log(`⚠️ Marcando espacio ${spaceId} como tiempo excedido`);
    
    const space = await spaceRepository.findOne({
      where: { id: spaceId, status: SPACE_STATUS.OCCUPIED },
      relations: ['bikerack'],
    });

    if (!space) {
      throw new Error('Espacio no encontrado o no está ocupado');
    }

    const reservation = await reservationRepository.findOne({
      where: { space: { id: spaceId }, status: RESERVATION_STATUS.ACTIVE },
      relations: ['user', 'bicycle'],
    });

    if (!reservation) {
      throw new Error('No se encontró reserva activa para este espacio');
    }

    // Calcular horas excedidas
    let exceededHours = 0;
    if (reservation.dateTimeActualArrival && reservation.estimatedHours) {
      const expectedDeparture = new Date(reservation.dateTimeActualArrival);
      expectedDeparture.setHours(expectedDeparture.getHours() + reservation.estimatedHours);
      const now = new Date();
      const diffMs = now - expectedDeparture;
      exceededHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
    }

    // Actualizar estado del espacio
    space.status = SPACE_STATUS.TIME_EXCEDIDO || 'Tiempo Excedido'; // Usar constante si existe
    await spaceRepository.save(space);

    console.log(`✅ Espacio ${space.spaceCode} marcado como tiempo excedido (${exceededHours}h)`);

    // Registrar en historial
    if (req) {
      const requestInfo = getRequestInfo(req);
      try {
        await HistoryService.logEvent({
          historyType: 'infraction', // Asegúrate que este tipo existe en HISTORY_TYPES
          description: `Tiempo excedido en espacio ${space.spaceCode}`,
          details: {
            spaceCode: space.spaceCode,
            exceededHours: exceededHours,
            estimatedHours: reservation.estimatedHours,
            reservationCode: reservation.reservationCode
          },
          userId: reservation.user.id,
          bicycleId: reservation.bicycle?.id,
          bikerackId: space.bikerack.id,
          spaceId: space.id,
          reservationId: reservation.id,
          guardId: req.user?.id,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent
        });
        console.log('✅ Infracción registrada en historial');
      } catch (historyError) {
        console.error('⚠️ Error registrando infracción en historial:', historyError.message);
      }
    }

    return {
      success: true,
      space,
      reservation,
      exceededHours,
      user: reservation.user
    };
  } catch (error) {
    console.error('❌ Error en markSpaceAsOverdue:', error);
    throw new Error(`Error marcando espacio como tiempo excedido: ${error.message}`);
  }
}
function calculateActualHours(reservation) {
  if (!reservation || !reservation.dateTimeActualArrival || !reservation.dateTimeActualDeparture) {
    return null;
  }
  
  try {
    const arrival = new Date(reservation.dateTimeActualArrival);
    const departure = new Date(reservation.dateTimeActualDeparture);
    const diffMs = departure - arrival;
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Horas con 2 decimales
  } catch (error) {
    console.error('Error calculando horas:', error);
    return null;
  }
}

// Exporta todas las funciones
export {
  occupySpaceWithReservation,
  occupySpaceWithoutReservation,
  liberateSpace,
  markSpaceAsOverdue,
  calculateActualHours
};