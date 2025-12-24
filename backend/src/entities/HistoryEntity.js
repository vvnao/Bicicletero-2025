// entities/HistoryEntity.js - VERSIÓN ACTUALIZADA
'use strict';

import { EntitySchema } from 'typeorm';

// AGREGAR LOS NUEVOS TIPOS PARA GUARDIAS
const HISTORY_TYPES = {
    // Tipos de usuario
    USER_CHECKIN: 'user_checkin',
    USER_CHECKOUT: 'user_checkout',
    USER_REGISTRATION_REQUEST: 'user_registration_request',
    USER_STATUS_CHANGE: 'user_status_change',
    
    // Tipos de guardia - AGREGAR ESTOS
    GUARD_CREATED: 'guard_created',
    GUARD_UPDATED: 'guard_updated',
    GUARD_DEACTIVATED: 'guard_deactivated',
    GUARD_ACTIVATED: 'guard_activated',
    GUARD_ASSIGNMENT: 'guard_assignment',
    GUARD_SHIFT_START: 'guard_shift_start',
    GUARD_SHIFT_END: 'guard_shift_end',
    GUARD_AVAILABILITY_CHANGE: 'guard_availability_change',
    
    // Tipos de reserva
    RESERVATION_CREATE: 'reservation_create',
    RESERVATION_CANCEL: 'reservation_cancel',
    RESERVATION_ACTIVATE: 'reservation_activate',
    RESERVATION_COMPLETE: 'reservation_complete',
    
    // Tipos de bicicleta
    BICYCLE_REGISTRATION: 'bicycle_registration',
    
    // Otros tipos
    INFRACTION: 'infraction',
    SYSTEM_NOTIFICATION: 'system_notification',
    ADMIN_ACTION: 'admin_action'
};

export const HistoryEntity = new EntitySchema({
    name: "History",
    tableName: "history",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        historyType: {
            type: "enum",
            enum: Object.values(HISTORY_TYPES),
            nullable: false,
            name: "history_type"
        },
        description: {
            type: "text",
            nullable: true
        },
        details: {
            type: "json",
            nullable: true
        },
        timestamp: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        ipAddress: {
            type: "varchar",
            length: 45,
            nullable: true,
            name: "ip_address"
        },
        userAgent: {
            type: "text",
            nullable: true,
            name: "user_agent"
        },
        created_at: {
            type: "timestamp",
            createDate: true,
            name: "created_at"
        }
    },
    relations: {
        user: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "userId" },
            nullable: true,
            eager: true
        },
        guard: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "guard_id" },
            nullable: true,
            eager: true
        },
        bicycle: {
            target: "Bicycle",
            type: "many-to-one",
            joinColumn: { name: "bicycleId" },
            nullable: true,
            eager: true
        },
        bikerack: {
            target: "Bikerack", 
            type: "many-to-one",
            joinColumn: { name: "bikerackId" },
            nullable: true,
            eager: true
        },
        reservation: {
            target: "Reservation",
            type: "many-to-one",
            joinColumn: { name: "reservationId" },
            nullable: true
        },
        space: {
            target: "Space",
            type: "many-to-one",
            joinColumn: { name: "spaceId" },
            nullable: true
        },
        assignment: {
            target: "GuardAssignment",
            type: "many-to-one",
            joinColumn: { name: "assignmentId" },
            nullable: true
        }
    }
});

export { HISTORY_TYPES };
export default HistoryEntity;