import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(UserEntity);
const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

export async function createUser(data) {
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear usuario con estado pendiente
    const newUser = userRepository.create({
        role: "user", // se fuerza por seguridad
        names: data.names,
        lastName: data.lastName,
        rut: data.rut,
        email: data.email,
        password: hashedPassword,
        contact: data.contact,
        typePerson: data.typePerson,
        tnePhoto: data.tnePhoto,
        position: data.position,
        positionDescription: data.positionDescription,
        requestStatus: "pendiente",
    });

    // Guardar usuario primero
    const savedUser = await userRepository.save(newUser);

    // Si vienen datos de bicicleta, crear y vincular
    if (data.bicycle) {
        const { brand, model, color, serialNumber, photo } = data.bicycle;

        const newBicycle = bicycleRepository.create({
            brand,
            model,
            color,
            serialNumber,
            photo,
            user: savedUser,
        });

        await bicycleRepository.save(newBicycle);
    }

    return savedUser;
}

export async function findUserByEmail(email) {
    return await userRepository.findOne({
        where: { email },
        relations: ["bicycles"], // incluir bicicletas si las tiene
    });
}