// entities/GuardAssignmentEntity.js
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
            createDate: true, 
            default: () => "CURRENT_TIMESTAMP",
        },
        status: {
            type: "enum",
            enum: ["activo", "inactivo"],
            default: "activo"
        }
    },
            // campos para horarios
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

    relations: {
        guard: { 
            target: "User",
            type: "many-to-one",
            joinColumn: true,
            nullable: false,
        },
        bikerack: {
            target: "Bikerack",
            type: "many-to-one",
            joinColumn: true,
            nullable: false,
        }
    }
});

export default GuardAssignmentEntity;