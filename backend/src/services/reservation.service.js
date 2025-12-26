import { In } from 'typeorm';
import { AppDataSource } from '../config/configDb.js';
import SpaceEntity, { SPACE_STATUS } from '../entities/SpaceEntity.js';
import ReservationEntity, { RESERVATION_STATUS } from '../entities/ReservationEntity.js';
import UserEntity from '../entities/UserEntity.js';
import BicycleEntity from '../entities/BicycleEntity.js';

const reservationRepository = AppDataSource.getRepository(ReservationEntity);
const spaceRepository = AppDataSource.getRepository(SpaceEntity);
const userRepository = AppDataSource.getRepository(UserEntity);
const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

export async function createAutomaticReservation(userId,bikerackId,estimatedHours,bicycleId) {
    try {
        const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['bicycles'],
        });
        
        if (!user) {
        return handleErrorClient(reservation,404,'Usuario no encontrado');
        }

        const pendingOrActiveReservation = await reservationRepository.findOne({
            where: {
                user: { id: userId },
                status: In([
                RESERVATION_STATUS.PENDING,
                RESERVATION_STATUS.ACTIVE,
                ]),
            },
        });

        if (pendingOrActiveReservation) {
            throw new Error('El usuario ya tiene una reserva vigente');
        }

        const userBicycleIds = user.bicycles.map(bicycle => bicycle.id);
        if (!userBicycleIds.includes(parseInt(bicycleId))) {
            throw new Error('Bicicleta no pertenece al usuario');
        }

        const bicycle = await bicycleRepository.findOne({ where:{id:bicycleId} });

        const space = await getNextAvailableSpace(bikerackId);
        if (!space) {
            throw new Error('No hay espacios disponibles en este bicicletero');
        }

        const reservationCode = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        const expirationTime = new Date(Date.now() + 30 * 60 * 1000);

        const reservation = reservationRepository.create({
            reservationCode,
            estimatedHours,
            expirationTime,
            status: RESERVATION_STATUS.PENDING,
            space: space,
            user: user,
            bicycle: bicycle,
        });

        space.status = SPACE_STATUS.RESERVED;

        await spaceRepository.save(space);
        await reservationRepository.save(reservation);

        console.log(`Reserva ${reservationCode} creada para espacio ${space.spaceCode}`);

        const reservationWithRelations = await reservationRepository.findOne({
        where: { id: reservation.id },
        relations: ['user', 'space', 'space.bikerack', 'bicycle'],
        });

        return reservationWithRelations;

    } catch (error) {
        throw error;
    }
}

export async function getNextAvailableSpace(bikerackId) {
    try {
        const spaces = await spaceRepository.find({
        where: {
            bikerack: { id: bikerackId },
            status: SPACE_STATUS.FREE,
        },
        order: { position: 'ASC' },
        });

        return spaces[0]; 
    } catch (error) {
        return handleErrorClient(res,500,"Error del servidor");
    }
}

export async function cancelReservation(reservationId, userId) {
    try {
        const reservation = await reservationRepository.findOne({
        where: { id: reservationId },
        relations: ['space', 'user', 'bicycle'],
        });

        if (!reservation) {
        return handleErrorClient(res,404,'Reserva no encontrada');
        }
        if (reservation.user.id !== userId) {
        return handleErrorClient(res,401,'No autorizado para cancelar esta reserva');
        }
        if (reservation.status !== RESERVATION_STATUS.PENDING) {
        return handleErrorClient(res,400,'Solo se pueden cancelar reservas pendientes');
        }

        reservation.space.status = SPACE_STATUS.FREE;
        reservation.status = RESERVATION_STATUS.CANCELED;

        await spaceRepository.save(reservation.space);
        await reservationRepository.save(reservation);

        return {reservation,space: reservation.space,user: reservation.user,};
    } catch (error) {
        return handleErrorClient(res,500,"Error del servidor");
    }
}

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
        return handleErrorClient(res,500,"Error del servidor");
    }
}