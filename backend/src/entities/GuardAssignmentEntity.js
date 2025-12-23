// entities/GuardAssignmentEntity.js - VERSIÓN CORREGIDA
import { EntitySchema } from "typeorm";

export const GuardAssignmentEntity = new EntitySchema({
    name: "GuardAssignment", 
    tableName: "guard_assignments", 
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        assignedAt: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        status: {
            type: "enum",
            enum: ["activo", "inactivo", "completado", "cancelado"],
            default: "activo"
        },
        startTime: {
            type: "time",
            nullable: false,
        },
        endTime: {
            type: "time",
            nullable: false,
        },
        daysOfWeek: {
            type: "simple-array",
            nullable: false,
            comment: "Días de la semana: lunes,martes,miércoles,jueves,viernes,sábado,domingo"
        },
        startDate: {
            type: "date",
            nullable: false,
            comment: "Fecha de inicio de la asignación"
        },
        endDate: {
            type: "date",
            nullable: true,
            comment: "Fecha de fin de la asignación (opcional)"
        },
        notes: {
            type: "text",
            nullable: true,
        },
        created_at: {
            type: "timestamp",
            createDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
        updated_at: {
            type: "timestamp",
            updateDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        guard: { 
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "guardId" },
            nullable: false,
            eager: true
        },
        bikerack: {
            target: "Bikerack",
            type: "many-to-one",
            joinColumn: { name: "bikerackId" },
            nullable: false,
            eager: true
        }
    }
});

export default GuardAssignmentEntity;