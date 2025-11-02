import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
    name: "user",
    tableName: "users",
    columns : {
        id : {
            primary : true,
            type : "int", 
            generated : "increment",
        },
        nombres : {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        apellidos : {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        rut : {
            type: "varchar",
            nullable: false,
            unique: true,
        },
        email : {
            type: "varchar",
            length: 255,
            unique: true,
            nullable: false,
        },
        password : {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        rol : {
            type: "varchar",
            length: 255,
            nullable: false, 
            enum: ["usuario", "guardia", "administrador"], 
        },
        tipo_usuario : {
            type: "varchar",
            length: 255,
            nullable: false, 
            enum: ["estudiante", "academico", "funcionario"], 
        },
        estado_solicitud : {
            type : Boolean,
            nullable: false,
        },
        created_at : {
            type: "timestamp",
            createDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
            updated_at : {
            type: "timestamp",
            updateDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
        //aquí debe ir como se relacionan con las otras tablas
    },
});
