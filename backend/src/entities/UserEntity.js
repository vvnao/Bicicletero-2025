import { EntitySchema } from "typeorm";

export const UserEntity = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        role: {
            type: "varchar",
            enum: ['admin', 'guardia', 'user'],
            default: 'user',
        },
        names: {
            type: "varchar",
            nullable: false,
        },
        lastName: {
            type: "varchar",
            nullable: false,
        },
        rut: {
            type: "varchar",
            nullable: false,
            unique: true,
        },
        email: {
            type: "varchar",
            unique: true,
            nullable: false,
        },
        password: {
            type: "varchar",
            nullable: false,
        },
        contact: {
            type: String,
            nullable: false,
        },
        typePerson: {
            type: "varchar",
            nullable: true,
            enum: ["estudiante", "academico", "funcionario"],
        },
        tnePhoto: {
            // solo para estudiantes
            type: String,
            nullable: true,
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
            type: "timestamp",
            createDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
        updated_at: {
            type: "timestamp",
            updateDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        bicycles: {
            target: 'Bicycle',
            type: 'one-to-many',
            inverseSide: 'user',
        },
        reservation : {
            target: 'Reservation',
            type: 'one-to-many',
            inverseSide: 'user',
        },
    },
});

export default UserEntity;
