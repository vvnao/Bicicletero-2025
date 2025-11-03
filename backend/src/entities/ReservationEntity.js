//* entidad para las reservas
'use strict';

import { EntitySchema } from 'typeorm';

export const Reservation = new EntitySchema({
  name: 'reservation',
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
    },
    dateTimeReservation: {
      //* fecha y hora de cuando se hizo la reserva
      type: 'timestamp',
      required: true,
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
      //* Pendiente, Activa, Completada, Cancelada, Expirada
      type: 'varchar',
      length: 50,
    },
  },
});

export default Reservation;

//* FALTAN LAS RELACIONES