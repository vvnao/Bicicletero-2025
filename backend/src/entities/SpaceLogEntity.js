'use strict';

import { EntitySchema } from 'typeorm';

const LOG_ACTIONS = {
    CHECKIN: 'checkin',
    CHECKOUT: 'checkout',
    RESERVATION_CREATED: 'reservation_created',
    RESERVATION_ACTIVATED: 'reservation_activated',
    MANUAL_UPDATE: 'manual_update',
    INFRACTION: 'infraction',
};

export const SpaceLog = new EntitySchema({
    name: 'SpaceLog',
    tableName: 'space_logs',
    columns: {
        id: {
        primary: true,
        type: 'int',
        generated: 'increment',
        },
        action: {
        type: 'varchar',
        length: 50,
        nullable: false,
        },
        // FECHAS REALES DE USO (se llenan cuando ocurren los eventos)
        actualCheckin: {
        type: 'timestamp',
        nullable: true, // Hora real de ingreso (cuando llega el usuario)
        },
        actualCheckout: {
        type: 'timestamp',
        nullable: true, // Hora real de salida (cuando se va el usuario)
        },
        estimatedCheckout: {
        type: 'timestamp',
        nullable: true, // Hora estimada de salida (calculada al check-in)
        },
        // CONTROL DE INFRACCIONES
        infractionStart: {
        type: 'timestamp',
        nullable: true, // Cuándo empezó la infracción
        },
        infractionDuration: {
        type: 'int',
        nullable: true, // Minutos en infracción
        },
        // METADATOS
        notes: {
        type: 'text',
        nullable: true, // Notas del guardia
        },
        created_at: {
        type: 'timestamp',
        createDate: true,
        default: () => 'CURRENT_TIMESTAMP',
        },
    },
    relations: {
        space: {
        type: 'many-to-one',
        target: 'Space',
        inverseSide: 'spaceLogs',
        nullable: false,
        joinColumn: {
            name: 'spaceId',
        },
        },
        user: {
        type: 'many-to-one',
        target: 'User',
        inverseSide: 'spaceLogs',
        nullable: false,
        joinColumn: {
            name: 'userId',
        },
        },
        bicycle: {
        type: 'many-to-one',
        target: 'Bicycle',
        inverseSide: 'spaceLogs',
        nullable: false,
        joinColumn: {
            name: 'bicycleId',
        },
        },
        reservation: {
        type: 'many-to-one',
        target: 'Reservation',
        inverseSide: 'spaceLogs',
        nullable: true, // Solo si viene de una reserva
        joinColumn: {
            name: 'reservationId',
        },
        },
    },
});

export { LOG_ACTIONS };
export default SpaceLog;