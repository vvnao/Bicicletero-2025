'use strict';

import { EntitySchema } from 'typeorm';

export const BicycleEntity = new EntitySchema({
    name: 'Bicycle',
    tableName: 'bicycles',
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        brand: { //marca
            type: String,
            nullable: false,
        },
        model: {
            type: String,
            nullable: false,
        },
        color: {
            type: String,
            nullable: false,
        },
        serialNumber: {
            // opcional si se usa para reserva o control
            type: String,
            nullable: true,
            unique: true,
        },
        photo: {
            type: "varchar",
            nullable: true, // optional if you store an image URL or path
        },
    },
    user: {
    target: 'User',
    type: 'many-to-one',
    joinColumn: {
        name: 'userId', //Join con tabla Bicycle
        referencedColumnName: 'id', //Esta para la tabla User
    },
    nullable: false,
    onDelete: "CASCADE",
    }
});

export default BicycleEntity;
