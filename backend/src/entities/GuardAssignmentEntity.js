
import { EntitySchema, JoinColumn } from "typeorm";

export const GuardAssignmentEntity = new EntitySchema({

    name: "GuardAssignmentEntity",
    tableName: "guard_assignment",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        assignedAt: {
            type: "timestamp",
            crateDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
        status: {
            type: "enum",
            enum: ["activo","inactivo"],
            default: "activo"
        }
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
