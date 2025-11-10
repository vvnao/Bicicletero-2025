"use strict";

import { AppDataSource } from "./configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import bcrypt from "bcrypt";

export async function createDefaultUsers() {
    try {
        const userRepository = AppDataSource.getRepository(UserEntity);

        // Verificar si ya hay usuarios creados
        const count = await userRepository.count();
        if (count > 0) return;

        // Usuarios por defecto
        const users = [
            {
                role: "admin",
                names: "Administrador General",
                lastName: "UBB",
                rut: "11.111.111-1",
                email: "admin@ubiobio.cl",
                password: await bcrypt.hash("admin123", 10),
                contact: "+56911111111",
                typePerson: null,
                requestStatus: "aprobado",
            },
            {
                role: "guardia",
                names: "Guardia General",
                lastName: "UBB",
                rut: "22.222.222-2",
                email: "guardia@ubiobio.cl",
                password: await bcrypt.hash("guardia123", 10),
                contact: "+56922222222",
                typePerson: null,
                requestStatus: "aprobado",
            },
        ];

        console.log("Creando usuarios por defecto...");

        for (const user of users) {
            await userRepository.save(userRepository.create(user));
            console.log(`Usuario '${user.email}' creado exitosamente.`);
        }
    } catch (error) {
        console.error("Error al crear usuarios por defecto:", error);
        process.exit(1);
    }
}
