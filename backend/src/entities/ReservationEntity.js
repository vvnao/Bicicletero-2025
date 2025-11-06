//* entidad para las reservas
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

export const Reservation = new EntitySchema({
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
    dateTimeLimit: {
      //* fecha y hora límite de cuanto puede estar la bicicleta en el bicicletero (tiempo estimado)
      type: 'timestamp',
      required: true,
    },
    dateTimeActualArrival: {
      //* fecha y hora real de llegada (cuando llegó el usuario al bicicletero)
      type: 'timestamp',
      nullable: true,
    },
    dateTimeActualDeparture: {
      //* fecha y hora real de salida (cuando el usuario se llevó la bicicleta)
      type: 'timestamp',
      nullable: true,
    },
    status: {
      type: 'varchar',
      length: 50,
      default: RESERVATION_STATUS.PENDING,
      nullable: false,
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
  },
});

export { RESERVATION_STATUS };
export default Reservation;

//*! FALTA RELACIÓN CON ENTIDAD USUARIO
//*! VER SI AGREGAR TIMESTAMPS (CREATED_AT, UPDATED_AT)
