import { EntitySchema } from 'typeorm';

const ReportHistoryEntity = new EntitySchema({
  name: 'ReportHistory',
  tableName: 'report_history',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    reportType: {
      type: 'varchar',
    },
    dateRange: {
      type: 'varchar',
    },
    format: {
      type: 'varchar',
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
  },
  relations: {
    generatedBy: {
      target: 'User', // Nombre de la entidad User
      type: 'many-to-one',
      joinColumn: true,
      eager: true, // Para que siempre traiga el nombre del admin
    },
  },
});

export default ReportHistoryEntity;