//! Esta entidad la usaré para el historial de check-ins/check-outs y para controlar infracciones (historial de uso de espacios)
'use strict';

import { EntitySchema } from 'typeorm';

export const LOG_ACTIONS = {
  CHECKIN: 'checkin',
  CHECKOUT: 'checkout',
};

export const LOG_FINAL_STATUS = {
  COMPLETED: 'Completado',
  TIME_EXCEEDED: 'Tiempo excedido',
};

export const SpaceLog = new EntitySchema({
  name: 'SpaceLog',
  tableName: 'space_logs',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    action: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    actualCheckin: {
      //! Hora real de ingreso (cuando llega el user)
      type: 'timestamp',
      nullable: true,
    },
    actualCheckout: {
      //! Hora real de salida (cuando se va el user)
      type: 'timestamp',
      nullable: true,
    },
    estimatedCheckout: {
      //! Hora estimada de salida (se calcula con el check-in + horas estimadas, por ej si checkin es a las 4:15 pm + 4 hrs estimadas = 8:15 pm estimado)
      type: 'timestamp',
      nullable: true,
    },
    infractionStart: {
      //! Cuando empieza la infracción, esto es: el estimatedCheckout + 15 minutos (15 minutos por el periodo de gracia)
      type: 'timestamp',
      nullable: true,
    },
    totalInfractionMinutes: {
      //! Total en minutos de lo que duró la infracción
      type: 'int',
      default: 0,
    },
    finalStatus: {
      //! Estado final del espacio al liberar: COMPLETED (salida normal) o TIME_EXCEEDED (salida con tiempo excedido)
      type: 'varchar',
      length: 20,
      nullable: true, //* es null mientras la bici está en el bicicletero
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    space: {
      type: 'many-to-one',
      target: 'Space',
      inverseSide: 'spaceLogs',
      nullable: false,
      joinColumn: {
        name: 'spaceId',
      },
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'spaceLogs',
      nullable: false,
      joinColumn: {
        name: 'userId',
      },
    },
    bicycle: {
      type: 'many-to-one',
      target: 'Bicycle',
      inverseSide: 'spaceLogs',
      nullable: true,
      joinColumn: {
        name: 'bicycleId',
      },
    },
    reservation: {
      type: 'many-to-one',
      target: 'Reservation',
      inverseSide: 'spaceLogs',
      nullable: true,
      joinColumn: {
        name: 'reservationId',
      },
    },
  },
});

export default SpaceLog;
