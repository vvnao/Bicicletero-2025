//* entidad bicicletero
'use strict';

import { EntitySchema } from 'typeorm';

export const Bikerack = new EntitySchema({
  name: 'Bikerack',
  tableName: 'bikeracks',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    name: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    location: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    capacity: {
      type: 'int',
      nullable: false,
    },
    status: {
      //* activo, inactivo o en mantenimiento. Aún no se si dejar esto (o ver si dejarlo como lleno, vacio o con espacios)
      type: 'varchar',
      length: 50,
    },
  },
  relations: {
    spaces: {
      type: 'one-to-many',
      target: 'Space',
      inverseSide: 'bikerack',
    },
    incidences: {
      type: 'one-to-many',
      target: 'Incidence',
      inverseSide: 'bikerack',
    },
    bicycles: {
    type: "one-to-many",
    target: "Bicycle",
    inverseSide: "bikerack",
  },
      guard: {
    type: "many-to-one",
    target: "User",
    joinColumn: { name: "guardId" },
    eager: true,
  }

  },
});

export default Bikerack;


