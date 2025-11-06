//* entidad para las incidencias
'use strict';

import { EntitySchema } from 'typeorm';

const INCIDENCE_STATUS = {
  OPEN: 'Abierta',
  IN_PROGRESS: 'En Proceso',
  RESOLVED: 'Resuelta',
  CLOSED: 'Cerrada',
};

const SEVERITY_LEVELS = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
};

export const Incidence = new EntitySchema({
  name: 'Incidence',
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
      type: 'varchar',
      length: 50,
      nullable: false,
      default: SEVERITY_LEVELS.MEDIUM,
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
      default: () => 'CURRENT_TIMESTAMP',
    },
    dateTimeIncident: {
      //* fecha y hora de cuando ocurrió la incidencia (lo ingresa guardia)
      type: 'timestamp',
      nullable: false,
    },
    status: {
      type: 'varchar',
      length: 50,
      nullable: false,
      default: INCIDENCE_STATUS.OPEN,
    },
  },
  relations: {
    bikerack: {
      type: 'many-to-one',
      target: 'Bikerack',
      inverseSide: 'incidences',
      nullable: false,
      joinColumn: {
        name: 'bikerackId',
      },
    },
    space: {
      type: 'many-to-one',
      target: 'Space',
      inverseSide: 'incidences',
      nullable: true,
      joinColumn: {
        name: 'spaceId',
      },
    },
  },
});

export { INCIDENCE_STATUS, SEVERITY_LEVELS };
export default Incidence;

//*! FALTA RELACIÓN CON ENTIDAD USUARIO
//*! VER SI AGREGAR TIMESTAMPS (CREATED_AT, UPDATED_AT)
