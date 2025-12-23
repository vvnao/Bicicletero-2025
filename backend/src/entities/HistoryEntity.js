// entities/HistoryEntity.js - VERSIÓN SIMPLIFICADA
'use strict';

import { EntitySchema } from 'typeorm';

// Definir los tipos de historial aquí también o importarlos
const HISTORY_TYPES = {
    USER_CHECKIN: 'user_checkin',
    USER_CHECKOUT: 'user_checkout',
    USER_REGISTRATION_REQUEST: 'user_registration_request',
    USER_STATUS_CHANGE: 'user_status_change',
    GUARD_ASSIGNMENT: 'guard_assignment',
    GUARD_SHIFT_START: 'guard_shift_start',
    GUARD_SHIFT_END: 'guard_shift_end',
    RESERVATION_CREATE: 'reservation_create',
    RESERVATION_CANCEL: 'reservation_cancel',
    RESERVATION_ACTIVATE: 'reservation_activate',
    RESERVATION_COMPLETE: 'reservation_complete',
    BICYCLE_REGISTRATION: 'bicycle_registration',
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
            joinColumn: { name: "guardId" },
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

// Si necesitas exportar HISTORY_TYPES, hazlo solo una vez
export { HISTORY_TYPES };
export default HistoryEntity;