//* entidad para los espacios del bicicletero
'use strict';

import { EntitySchema } from 'typeorm';

const SPACE_STATUS = {
  FREE: 'Libre',
  RESERVED: 'Reservado',
  OCCUPIED: 'Ocupado',
  TIME_EXCEEDED: 'Tiempo Excedido',
};

export const Space = new EntitySchema({
  name: 'Space',
  tableName: 'spaces',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    spaceCode: {
      type: 'varchar',
      length: 100,
      nullable: false,
      unique: true,
    },
    status: {
      type: 'varchar',
      length: 50,
      nullable: false,
      default: SPACE_STATUS.FREE,
    },
  },
  relations: {
    bikerack: {
      type: 'many-to-one',
      target: 'Bikerack',
      inverseSide: 'spaces',
      nullable: false,
      joinColumn: {
        name: 'bikerackId',
      },
    },
    reservations: {
      type: 'one-to-many',
      target: 'Reservation',
      inverseSide: 'space',
    },
    incidences: {
      type: 'one-to-many',
      target: 'Incidence',
      inverseSide: 'space',
    },
  },
});

export { SPACE_STATUS };
export default Space;

//*! VER SI AGREGAR TIMESTAMPS (CREATED_AT, UPDATED_AT)
