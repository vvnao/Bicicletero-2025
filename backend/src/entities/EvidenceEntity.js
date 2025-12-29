'use strict';

import { EntitySchema } from 'typeorm';

export const EvidenceEntity = new EntitySchema({
  name: 'Evidence',
  tableName: 'evidence',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    url: {
      type: 'varchar',
      length: 500,
      nullable: false,
    },
    filename: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    originalName: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    mimeType: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    size: {
      type: 'int',
      nullable: false,
    },
    uploadedAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    order: {
      type: 'int',
      nullable: false,
      default: 0,
    },
  },
  relations: {
    incidence: {
      type: 'many-to-one',
      target: 'Incidence',
      inverseSide: 'evidences',
      nullable: false,
      joinColumn: {
        name: 'incidenceId',
      },
    },
  },
});

export default EvidenceEntity;
