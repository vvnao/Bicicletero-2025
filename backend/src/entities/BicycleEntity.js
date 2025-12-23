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
      type: 'varchar',
      nullable: false,

    },
    model: {
      type: 'varchar',
      nullable: false,
    },
    color: {
      type: 'varchar',
      nullable: false,
    },
    serialNumber: {
      // opcional si se usa para reserva o control
      type: 'varchar',
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
      target: 'User',
      type: 'many-to-one',
      joinColumn: true,
      nullable: false,
      onDelete: 'CASCADE',
    },
    reservations: {
      target: 'Reservation',
      type: 'one-to-many',
      inverseSide: 'bicycle',
    },
    spaceLogs: {
      target: 'SpaceLog',
      type: 'one-to-many',
      inverseSide: 'bicycle',
    },
        bikerack: {
            type: 'many-to-one',
            target: 'Bikerack',
            joinColumn: { name: 'bikerackId' },
            nullable: true,
            eager: true,
            inverseSide: 'bicycles',
        },


  },
});

export default BicycleEntity;
