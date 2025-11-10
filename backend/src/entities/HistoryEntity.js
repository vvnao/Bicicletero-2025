import { EntitySchema } from "typeorm";

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
        }
    },
    relations: {
        bicycle: {
            target: "Bicycle",
            type: "many-to-one",
            joinColumn: true,
            nullable: false,
        },
        bikeRack: {
            target: "BikeRack",
            type: "many-to-one",
            joinColumn: true,
            nullable: false,
        },
        guard: {
            target: "User",
            type: "many-to-one",
            joinColumn: true,
            nullable: false,
        }
    }
});

export default HistoryEntity;