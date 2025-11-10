'use strict';

import { EntitySchema } from 'typeorm';

const RESERVATION_STATUS = {
  //! aún no se si dejar esto
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
      //! Fecha y hora de cuando se hizo la reserva (cuando el user aprieta botón "reservar")
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    estimatedHours: {
      //! Horas estimadas que estará la bicicleta (el user lo ingresa al hacer la reserva)
      type: 'int',
      nullable: false,
    },
    expirationTime: {
      //! Cuándo expira la reserva si el user no llega (por ej 2 horas después de hacer la reserva)
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
