import { EntitySchema } from 'typeorm';

export const UserEntity = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    role: {
      type: 'varchar',
      enum: ['admin', 'guardia', 'user'],
      default: 'user',
    },
    names: {
      type: 'varchar',
      nullable: false,
    },
    lastName: {
      type: 'varchar',
      nullable: false,
    },
    rut: {
      type: 'varchar',
      nullable: false,
      unique: true,
    },
    email: {
      type: 'varchar',
      unique: true,
      nullable: false,
    },
    password: {
      type: 'varchar',
      nullable: false,
    },
    contact: {
      type: String,
      nullable: true,
    },
    typePerson: {
      type: 'varchar',
      nullable: false,
      enum: ['estudiante', 'academico', 'funcionario'],
    },
    tnePhoto: {
      // solo para estudiantes
      type: String,
      nullable: true,
    },
    //Para desactivar un perfil pero no borrarlo de la base de datos
    isActive: {
      type: "boolean",
      default: true,
      nullable: false,
    },
    position: {
      // solo para funcionario
      type: String,
      nullable: true,
    },
    positionDescription: {
      // solo para funcionario
      type: String,
      nullable: true,
    },
    requestStatus: {
      // solo se usa si role === 'user'
      type: 'enum',
      enum: ['pendiente', 'aprobado', 'rechazado'],
      default: 'pendiente',
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
    bicycles: {
      target: 'Bicycle',
      type: 'one-to-many',
      inverseSide: 'user',
    },
    guard: {
      target: 'Guard',
      type: 'one-to-one',
      inverseSide: 'user',
    },
    reservations: {
      target: 'Reservation',
      type: 'one-to-many',
      inverseSide: 'user',
    },
    spaceLogs: {
      target: 'SpaceLog',
      type: 'one-to-many',
      inverseSide: 'user',
    },
    assignedBikeracks: {
      target: 'Bikerack',
      type: 'many-to-many',
      mappedBy: 'guards',
    },
  },
});

export default UserEntity;
