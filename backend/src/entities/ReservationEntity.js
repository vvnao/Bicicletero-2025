'use strict';

import { EntitySchema } from 'typeorm';

const RESERVATION_STATUS = {
  //* revisar
  PENDING: 'Pendiente',
  ACTIVE: 'Activa',
  COMPLETED: 'Completada',
  CANCELED: 'Cancelada',
  EXPIRED: 'Expirada',
};

export const ReservationEntity = new EntitySchema({
  name: 'Reservation',
  tableName: 'reservations',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    reservationCode: {
      type: 'varchar',
      length: 100,
      nullable: false,
      unique: true,
    },
    dateTimeReservation: {
      //* fecha y hora de cuando se hizo la reserva
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    dateTimeEstimatedArrival: {
      //* fecha y hora estimada de llegada (cuando el usuario planea llegar)
      type: 'timestamp',
      required: true,
    },
    estimatedHours: {
      //* horas estimadas que estará la bicicleta
      type: 'int',
      nullable: false,
    },
    expirationTime: {
      //* cuándo expira la reserva si no se usa (por ej 2 horas después de hacer la reserva)
      type: 'timestamp',
      nullable: false,
    },
    status: {
      type: 'varchar',
      length: 50,
      default: RESERVATION_STATUS.PENDING,
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
    space: {
      type: 'many-to-one',
      target: 'Space',
      inverseSide: 'reservations',
      nullable: false,
      joinColumn: {
        name: 'spaceId',
      },
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'reservations',
      nullable: false,
      joinColumn: {
        name: 'userId',
      },
    },
    bicycle: {
      type: 'many-to-one',
      target: 'Bicycle',
      inverseSide: 'reservations',
      nullable: false,
      joinColumn: {
        name: 'bicycleId',
      },
    },
    spaceLog: {
      type: 'one-to-one',
      target: 'SpaceLog',
      inverseSide: 'reservation',
      nullable: true,
      joinColumn: {
        name: 'spaceLogId',
      },
    },
  },
});

export { RESERVATION_STATUS };
export default ReservationEntity;