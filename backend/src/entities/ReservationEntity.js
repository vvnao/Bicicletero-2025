'use strict';

import { EntitySchema } from 'typeorm';

export const RESERVATION_STATUS = {
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
      //! Horas estimadas que estará la bicicleta (el user lo ingresa al hacer la reserva, o el guardia lo ingresa si es reserva manual)
      type: 'int',
      nullable: false,
    },
    expirationTime: {
      //! Cuándo expira la reserva si el user no llega (30 minutos de espera)
      type: 'timestamp',
      nullable: true,
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
      nullable: true,
      joinColumn: {
        name: 'bicycleId',
      },
    },
  },
});

export default ReservationEntity;
