//* entidad para las incidencias
'use strict';

import { EntitySchema } from 'typeorm';

export const Incidence = new EntitySchema({
  name: 'incidence',
  tableName: 'incidences',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    incidenceType: {
      //* Será una lista predefinida: Daño, Robo, etc
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    severity: {
      //* Será una lista predefinida: baja, media, alta
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: false,
    },
    evidenceUrl: {
      //* url de la imagen/video/etc que se suba de la incidencia (evidencia es opcional)
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    dateTimeReport: {
      //* fecha y hora de cuando se crea la incidencia (automático)
      type: 'timestamp',
      nullable: false,
    },
    dateTimeIncident: {
      //* fecha y hora de cuando ocurrió la incidencia (lo ingresa guardia)
      type: 'timestamp',
      nullable: false,
    },
    status: {
      //* Abierta, En Proceso, Resuelta, Cerrada
      type: 'varchar',
      length: 50,
      nullable: false,
    },
  },
});

export default Incidence;

//* FALTAN LAS RELACIONES