'use strict';
import { EntitySchema } from 'typeorm';

export const BikerackEntity = new EntitySchema({
  name: 'Bikerack',
  tableName: 'bikeracks',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    name: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    capacity: {
      type: 'int',
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
    spaces: {
      type: 'one-to-many',
      target: 'Space',
      inverseSide: 'bikerack',
    },
    incidences: {
      type: 'one-to-many',
      target: 'Incidence',
      inverseSide: 'bikerack',
    },
    guards: {
      target: 'Guard',
      type: 'one-to-many',
      inverseSide: 'bikerack',
    },
    guardAssignments: {
      target: 'GuardAssignment',
      type: 'one-to-many',
      inverseSide: 'bikerack',
    },
  },
});

export default BikerackEntity;