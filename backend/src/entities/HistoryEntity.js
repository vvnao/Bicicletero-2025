// entities/HistoryEntity.js - Versión corregida para PostgreSQL
'use strict';

import { EntitySchema } from 'typeorm';

export const HistoryEntity = new EntitySchema({
    name: "History",
    tableName: "history",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        movementType: {
            type: "enum",
            enum: ["ingreso", "salida"],
            nullable: false
        },
        timestamp: {
            type: "timestamp",
            createDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
        guardNotes: {
            type: "text",
            nullable: true
        },
        spaceLogId: {
            type: "int",
            nullable: true
        }
    },
    relations: {
        bicycle: {
            target: "Bicycle",
            type: "many-to-one",
            joinColumn: { name: "bicycleId" },
            nullable: false,
            eager: true
        },
        bikerack: {
            target: "Bikerack", 
            type: "many-to-one",
            joinColumn: { name: "bikerackId" },
            nullable: false,
            eager: true
        },
        guard: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "guardId" },
            nullable: false,
            eager: true
        },
        user: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "userId" },
            nullable: false,
            eager: true
        },
        spaceLog: {
            target: "SpaceLog",
            type: "many-to-one",
            joinColumn: { name: "spaceLogId" },
            nullable: true
        }
    }
});

export default HistoryEntity;