//* entidad para los espacios del bicicletero
'use strict';

import { EntitySchema } from 'typeorm';

export const Space = new EntitySchema({
  name: 'space',
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
    },
    status: {
      //* Libre, Reservado, Ocupado, En Infracción
      type: 'varchar',
      length: 50,
      nullable: false,
    },
  },
});

export default Space;

//* FALTAN LAS RELACIONES

