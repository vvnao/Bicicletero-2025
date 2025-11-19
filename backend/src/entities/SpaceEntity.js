'use strict';

import { EntitySchema } from 'typeorm';

const SPACE_STATUS = {
  FREE: 'Libre',
  RESERVED: 'Reservado',
  OCCUPIED: 'Ocupado',
  TIME_EXCEEDED: 'Tiempo Excedido',
};

export const SpaceEntity = new EntitySchema({
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
      length: 50,
      nullable: false,
      unique: true,
    },
    status: {
      type: 'varchar',
      length: 50,
      nullable: false,
      default: SPACE_STATUS.FREE,
    },
    position: {
      //! Orden físico de los espacios dentro del bicicletero (c-1 -> 1era posición (1), c-2 -> 2da posición (2), ...)
      type: 'int',
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
      default: () => 'CURRENT_TIMESTAMP',
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
      default: () => 'CURRENT_TIMESTAMP',
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
    currentLog: {
      //! Solo el log activo (si el espacio está en uso)
      type: 'one-to-one',
      target: 'SpaceLog',
      inverseSide: 'space',
      nullable: true,
      joinColumn: true,
    },
    spaceLogs: {
      //! Para el historial completo de todos los usos del espacio
      type: 'one-to-many',
      target: 'SpaceLog',
      inverseSide: 'space',
    },
  },
});

export { SPACE_STATUS };
export default SpaceEntity;
