//* entidad bicicletero
'use strict';

import { EntitySchema } from 'typeorm';

export const Bikerack = new EntitySchema({
  name: 'bikerack',
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
      //* activo, inactivo o en mantenimiento. Aún no se si dejar esto
      type: 'varchar',
      length: 50,
    },
  },
});

export default Bikerack;
