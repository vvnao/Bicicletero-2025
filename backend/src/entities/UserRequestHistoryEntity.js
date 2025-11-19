import { EntitySchema } from 'typeorm';

export const UserRequestHistoryEntity = new EntitySchema({
  name: 'UserRequestHistory',
  tableName: 'user_request_history',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    previousStatus: {
      type: 'varchar',
      nullable: true,
    },
    newStatus: {
      type: 'varchar',
      nullable: false,
    },
    comments: {
      type: 'text',
      nullable: true,
    },
    timestamp: {
      type: 'timestamp',
      createDate: true,
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: true,
      nullable: false,
    },
    reviewedBy: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: { name: 'reviewed_by_id' },
      nullable: true,
    },
  },
});

export default UserRequestHistoryEntity;