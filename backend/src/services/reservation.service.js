import { AppDataSource } from '../config/configDb.js';
import { sendEmail } from './email.service.js';
import { emailTemplates } from '../templates/reservationEmail.template.js';
import { LessThan } from 'typeorm';
import SpaceEntity, { SPACE_STATUS } from '../entities/SpaceEntity.js';
import ReservationEntity, {
    RESERVATION_STATUS,
} from '../entities/ReservationEntity.js';

import UserEntity from '../entities/UserEntity.js';
import BicycleEntity from '../entities/BicycleEntity.js';
import BikerackEntity from '../entities/BikerackEntity.js';

const reservationRepository = AppDataSource.getRepository(ReservationEntity);
const spaceRepository = AppDataSource.getRepository(SpaceEntity);
const userRepository = AppDataSource.getRepository(UserEntity);
const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
////////////////////////////////////////////////////////////////////////////////////////////
//! OBTENER BICICLETAS DEL USUARIO
export async function getUserBicycles(userId) {
    try {
        const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['bicycles'],
        });

        if (!user) {
        throw new Error('Usuario no encontrado');
        }

        return user.bicycles.map((bicycle) => ({
        id: bicycle.id,
        brand: bicycle.brand,
        model: bicycle.model,
        color: bicycle.color,
        photo: bicycle.photo,
        serialNumber: bicycle.serialNumber,
        }));
    } catch (error) {
        if (error.message === 'Usuario no encontrado') throw error;
        throw new Error(`Error obteniendo bicicletas: ${error.message}`);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! CREAR RESERVA AUTOMÁTICA CON TRANSACCIÓN
export async function createAutomaticReservation(
    userId,
    bikerackId,
    estimatedHours,
    bicycleId
    ) {
    //* se crea el  query runner para transacción
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
        await queryRunner.startTransaction();

        //* obtener usuario dentro de la transacción
        const user = await queryRunner.manager.findOne('User', {
        where: { id: userId },
        relations: ['bicycles', 'reservations'],
        });

        if (!user) {
        throw new Error('Usuario no encontrado');
        }

        const hasActiveProcess = user.reservations?.some(
        (res) =>
            res.status === RESERVATION_STATUS.PENDING ||
            res.status === RESERVATION_STATUS.ACTIVE
        );

        if (hasActiveProcess) {
        throw new Error(
            'El usuario ya tiene una reserva activa o una bicicleta en el sistema.'
        );
        }

        //* valida que la bicicleta pertenece al usuario
        const userBicycleIds = user.bicycles.map((bicycle) => bicycle.id);
        if (!userBicycleIds.includes(parseInt(bicycleId))) {
        throw new Error('Bicicleta no pertenece al usuario');
        }

        //* se obtiene la bicicleta específica (por que son máximo 3 bicis por user)
        const bicycle = await queryRunner.manager.findOne('Bicycle', {
        where: { id: bicycleId },
        });

        //* obtener el espacio con lock
        const space = await getNextAvailableSpace(bikerackId, queryRunner);
        if (!space) {
        await queryRunner.rollbackTransaction();
        throw new Error('No hay espacios disponibles en este bicicletero');
        }

        const nowUTC = new Date();
        const expirationTimeUTC = new Date(nowUTC.getTime() + 30 * 60 * 1000);

        //* calcula hora de expiración en hora de Chile para el email
        const expirationTimeChile = expirationTimeUTC.toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        });

        const reservationCode = `R${Math.floor(1000 + Math.random() * 9000)}`;

        //* se crea la reserva dentro de la transacción
        const reservation = queryRunner.manager.create(ReservationEntity, {
        reservationCode,
        estimatedHours,
        expirationTime: expirationTimeUTC,
        status: RESERVATION_STATUS.PENDING,
        space: space,
        user: user,
        bicycle: bicycle,
        });

        await queryRunner.manager.save(ReservationEntity, reservation);

    await queryRunner.commitTransaction();

        const reservationWithRelations = await reservationRepository.findOne({
        where: { id: reservation.id },
        relations: ['user', 'space', 'space.bikerack', 'bicycle'],
        });

        reservationWithRelations.expirationTimeChile = expirationTimeChile;
        return reservationWithRelations;
    } catch (error) {
        await queryRunner.rollbackTransaction();

        const businessErrors = [
        'no encontrado',
        'ya tiene una reserva',
        'no pertenece',
        'disponibles',
        ];

        if (
        businessErrors.some((msg) => error.message.toLowerCase().includes(msg))
        ) {
        throw error;
        }

        throw new Error(`Error inesperado al crear reserva: ${error.message}`);
    } finally {
    }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! OBTENER PRÓXIMO ESPACIO DISPONIBLE CON LOCK (para concurrencia)
export async function getNextAvailableSpace(bikerackId, queryRunner) {
    const manager = queryRunner ? queryRunner.manager : AppDataSource.manager;

    const space = await manager.findOne(SpaceEntity, {
        where: {
        bikerack: { id: bikerackId },
        status: SPACE_STATUS.FREE,
        },
        order: { position: 'ASC' },
        //* el LOCK PESIMISTA bloquea la fila hasta que termine la transacción
        lock: { mode: 'pessimistic_write' },
    });

    if (!space) return null;

    space.status = SPACE_STATUS.RESERVED;
    await manager.save(SpaceEntity, space);

    console.log(`[LOCK] Espacio ${space.spaceCode} bloqueado para nuevo trámite`);
    return space;
}
////////////////////////////////////////////////////////////////////////////////////////////
//! CANCELAR RESERVA
export async function cancelReservation(reservationId, userId) {
    try {
        const reservation = await reservationRepository.findOne({
        where: { id: reservationId },
        relations: ['space', 'user', 'bicycle'],
        });

        if (!reservation) {
        throw new Error('Reserva no encontrada');
        }

        if (reservation.user.id !== userId) {
        throw new Error('No autorizado para cancelar esta reserva');
        }

        if (reservation.status !== RESERVATION_STATUS.PENDING) {
        throw new Error('Solo se pueden cancelar reservas pendientes');
        }

        reservation.space.status = SPACE_STATUS.FREE;
        reservation.status = RESERVATION_STATUS.CANCELED;

        await spaceRepository.save(reservation.space);
        await reservationRepository.save(reservation);

        return {
        reservation,
        space: reservation.space,
        user: reservation.user,
        };
    } catch (error) {
        const businessErrors = ['no encontrada', 'autorizado', 'pendientes'];

        if (
        businessErrors.some((msg) => error.message.toLowerCase().includes(msg))
        ) {
        throw error;
        }

        throw new Error(`Error técnico al cancelar reserva: ${error.message}`);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! OBTENER RESERVAS DE UN USUARIO
export async function getUserReservations(userId) {
    try {
        const reservations = await reservationRepository.find({
        where: { user: { id: userId } },
        relations: ['space', 'space.bikerack', 'bicycle'],
        order: { created_at: 'DESC' },
        });

        return reservations.map((reservation) => ({
        id: reservation.id,
        reservationCode: reservation.reservationCode,
        status: reservation.status,
        spaceCode: reservation.space.spaceCode,
        bikerackName: reservation.space.bikerack.name,
        estimatedHours: reservation.estimatedHours,
        expirationTime: reservation.expirationTime,
        bicycle: {
            brand: reservation.bicycle.brand,
            model: reservation.bicycle.model,
            color: reservation.bicycle.color,
        },
        createdAt: reservation.created_at,
        }));
    } catch (error) {
        throw new Error(`Error obteniendo historial de reservas: ${error.message}`);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////
//! EXPIRAR RESERVAS VENCIDAS (30 minutos después de creada) - (con transacción para evitar conflictos)
export async function expireOldReservations() {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

  try {
    const now = new Date();
    //*esto lo uso para probar la función, cree que son 29 minutos en el futuro
    //const now = new Date(Date.now() + 29 * 60 * 1000);
    let expiredCount = 0;

        const reservationsToLock = await queryRunner.manager.find('Reservation', {
        where: {
            status: RESERVATION_STATUS.PENDING,
            expirationTime: LessThan(now),
        },
        select: ['id'],
        lock: { mode: 'pessimistic_write' },
        });

        if (reservationsToLock.length === 0) {
        await queryRunner.rollbackTransaction();
        return 0;
        }

        for (const resShort of reservationsToLock) {
        const reservation = await queryRunner.manager.findOne('Reservation', {
            where: { id: resShort.id },
            relations: ['space', 'user', 'bicycle'],
        });

        if (!reservation) continue;

        reservation.status = RESERVATION_STATUS.EXPIRED;
        await queryRunner.manager.save('Reservation', reservation);

        if (
            reservation.space &&
            reservation.space.status === SPACE_STATUS.RESERVED
        ) {
            reservation.space.status = SPACE_STATUS.FREE;
            await queryRunner.manager.save('Space', reservation.space);
        }

        if (reservation.user?.email) {
            const emailHtml = emailTemplates.reservationExpired(
            reservation.user,
            reservation
            );

        await sendEmail(
            reservation.user.email,
            'Reserva Expirada - Bicicletero UBB',
            emailHtml
            );
        }

        console.log(
            `--> Reserva ${reservation.reservationCode} expirada y espacio ${reservation.space?.spaceCode} liberado.`
        );
        expiredCount++;
        }

        await queryRunner.commitTransaction();
        return expiredCount;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error en expireOldReservations:', error.message);
        return 0;
    } finally {
        await queryRunner.release();
    }
}
export async function getAvailableSpaces() {
    try {
        const bikerackRepository = AppDataSource.getRepository(BikerackEntity);
        const bikeracks = await bikerackRepository.find({
            relations: ['spaces', 'spaces.reservations'],
        });

        const availableSummary = bikeracks.map((bikerack) => {
            const spaces = bikerack.spaces || [];

            const occupiedSpaces = spaces.filter((space) => {
                const hasActiveRes = space.reservations?.some(
                    (res) => res.status === 'Activada'
                );
                return hasActiveRes;
            }).length;

            const availableSpaces = bikerack.capacity - occupiedSpaces;

            return {
                id: bikerack.id,
                name: bikerack.name,
                capacity: bikerack.capacity,
                availableSpaces: availableSpaces < 0 ? 0 : availableSpaces,
            };
        });

        return availableSummary;
    } catch (error) {
        throw new Error(`Error al obtener espacios disponibles: ${error.message}`);
    }
}