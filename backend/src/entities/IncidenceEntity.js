'use strict';

import { EntitySchema } from 'typeorm';

export const INCIDENCE_TYPES = {
  DAMAGE: 'Daño a propiedad',
  ABANDONED: 'Bicicleta abandonada',
  INAPPROPRIATE_BEHAVIOR: 'Comportamiento inapropiado',
  USER_CONFLICT: 'Conflicto entre usuarios',
  THEFT_ATTEMPT: 'Intento de robo',
  SECURITY_BREACH: 'Incumplimiento de seguridad',
  EQUIPMENT_FAILURE: 'Fallo de equipamiento',
  OTHER: 'Otro',
};

export const INCIDENCE_STATUS = {
  OPEN: 'Abierta',
  IN_PROGRESS: 'En Proceso',
  RESOLVED: 'Resuelta',
  CLOSED: 'Cerrada',
};

export const SEVERITY_LEVELS = {
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
      type: 'varchar',
      length: 100,
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
      //! url de la imagen/video/etc que se suba de la incidencia (evidencia es opcional)
      type: 'varchar',
      length: 500,
      nullable: true,
    },
    dateTimeReport: {
      //! fecha y hora de cuando se crea la incidencia (automático)
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    dateTimeIncident: {
      //! fecha y hora de cuando ocurrió la incidencia (lo ingresa guardia)
      type: 'timestamp',
      nullable: false,
    },
    status: {
      type: 'varchar',
      length: 50,
      nullable: false,
      default: INCIDENCE_STATUS.OPEN,
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
    //* guardia que reporta la incidencia 
    reporter: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'reportedIncidences',
      nullable: false,
      joinColumn: {
        name: 'reporterId',
      },
    },
    //* usuario involucrado (opcional)
    involvedUser: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'involvedIncidences',
      nullable: true,
      joinColumn: {
        name: 'involvedUserId',
      },
    },
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

export default Incidence;