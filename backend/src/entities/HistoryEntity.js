"use strict";

import { EntitySchema } from "typeorm";

export const HISTORY_TYPES = {
  USER_CHECKIN: "usuario_checkin",
  USER_CHECKOUT: "usuario_checkout",
  BICYCLE_REGISTER: "registro_bicicleta",
  BICYCLE_REMOVE: "bicicleta_retirada",
  GUARD_ASSIGNMENT: "asignación_guardia",
  RESERVATION_CREATE: "reservación_creada",
  RESERVATION_CANCEL: "reservación_cancelada",
  INCIDENT_REPORT: "reporte_incidente",
  GUARD_CREATED: "guardia_creado",
  GUARD_ASSIGNMENT: "asignación_guardia",
  GUARD_TOGGLE_STATUS: "guard_toggle_status",
  INCIDENT_REPORT: "incident_report",
};

const HistoryEntity = new EntitySchema({
  name: "History",
  tableName: "history",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    type: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    description: {
      type: "text",
      nullable: false,
    },
    details: {
      type: "json",
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      default: () => "now()",
    },
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "user_id" },
      nullable: true,
      onDelete: "SET NULL",
    },
    guard: {
      target: "Guard",
      type: "many-to-one",
      joinColumn: { name: "guard_id" },
      nullable: true,
      onDelete: "SET NULL",
    },
    bicycle: {
      target: "Bicycle",
      type: "many-to-one",
      joinColumn: { name: "bicycle_id" },
      nullable: true,
      onDelete: "SET NULL",
    },
    reservation: {
      target: "Reservation",
      type: "many-to-one",
      joinColumn: { name: "reservation_id" },
      nullable: true,
      onDelete: "SET NULL",
    },
    space: {
      target: "Space",
      type: "many-to-one",
      joinColumn: { name: "space_id" }, 
      onDelete: "SET NULL",
    },
    bikerack: {
      target: "Bikerack",
      type: "many-to-one",
      joinColumn: { name: "bikerack_id" },
      nullable: true,
      onDelete: "SET NULL",
    },
  },
});

export default HistoryEntity;
