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
        brand: {
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
        type: String,
        nullable: true,
        unique: true,
        },
        photo: {
        type: 'varchar',
        nullable: true,
        },
    },
    relations: {
        user: {
        type: 'many-to-one',
        target: 'User',
        joinColumn: { name: 'userId' },
        eager: true,
        nullable: false,
        inverseSide: 'bicycles',
        },

      bikerack: {
            type: 'many-to-one',
            target: 'Bikerack',
            joinColumn: { name: 'bikerackId' },
            nullable: true,
            eager: true,
            inverseSide: 'bicycles',
        }


    },
});

export default BicycleEntity;