//! Esta entidad la usaré para el historial de check-ins/check-outs y para controlar infracciones (historial de uso de espacios)
'use strict';

import { EntitySchema } from 'typeorm';

const LOG_ACTIONS = {
  CHECKIN: 'checkin',
  CHECKOUT: 'checkout',
  RESERVATION_CREATED: 'reservation_created',
  RESERVATION_ACTIVATED: 'reservation_activated',
  MANUAL_UPDATE: 'manual_update',
  INFRACTION: 'infraction',
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
      //! Cuando estimatedCheckout es superado
      type: 'timestamp',
      nullable: true,
    },
    infractionDuration: {
      //! Duración de la infracción en minutos
      type: 'int',
      nullable: true,
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
      nullable: false,
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

export { LOG_ACTIONS };
export default SpaceLog;
