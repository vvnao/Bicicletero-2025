// entities/GuardAssignmentEntity.js - VERSIÓN CON HORARIOS FIJOS
import { EntitySchema } from 'typeorm';

export const GuardAssignmentEntity = new EntitySchema({
    name: 'GuardAssignment',
    tableName: 'guard_assignments',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: 'increment',
        },
        guardId: {
            type: 'int',
            nullable: false,
            name: 'guard_id'
        },
        bikerackId: {
            type: 'int',
            nullable: false,
            name: 'bikerack_id'
        },
        // Día de la semana (0=domingo, 1=lunes, ..., 6=sábado)
        dayOfWeek: {
            type: 'int',
            nullable: false,
            name: 'day_of_week'
        },
        // Hora de inicio en formato 'HH:MM'
        startTime: {
            type: 'varchar',
            length: 5,
            nullable: false,
            name: 'start_time'
        },
        // Hora de fin en formato 'HH:MM'
        endTime: {
            type: 'varchar',
            length: 5,
            nullable: false,
            name: 'end_time'
        },
        // Fecha desde cuando es válido este horario
        effectiveFrom: {
            type: 'date',
            nullable: false,
            default: () => 'CURRENT_DATE',
            name: 'effective_from'
        },
        // Fecha hasta cuando es válido (null = indefinido)
        effectiveUntil: {
            type: 'date',
            nullable: true,
            name: 'effective_until'
        },
        // Estado: 'activo', 'inactivo', 'suspendido'
        status: {
            type: 'varchar',
            length: 20,
            default: 'activo'
        },
        assignedBy: {
            type: 'int',
            nullable: false,
            name: 'assigned_by'
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
            name: 'created_at'
        },
        updatedAt: {
            type: 'timestamp',
            updateDate: true,
            name: 'updated_at'
        },
    },
     relations: {
        guard: {
            target: 'Guard',
            type: 'many-to-one',
            joinColumn: { 
                name: 'guard_id',
                referencedColumnName: 'id'
            },
            inverseSide: 'assignments',
        },
        bikerack: {
            target: 'Bikerack',
            type: 'many-to-one',
            joinColumn: { 
                name: 'bikerack_id',
                referencedColumnName: 'id'
            },
        },
        assignedByUser: {
            target: 'User',
            type: 'many-to-one',
            joinColumn: { 
                name: 'assigned_by',
                referencedColumnName: 'id'
            },
        },
    },
});