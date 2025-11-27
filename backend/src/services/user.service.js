import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(UserEntity);
const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

// CREAR USUARIO
export async function createUser(data) {

    const existingUser = await userRepository.findOne({
        where: [
            { email: data.email },
            { rut: data.rut }
        ],
        relations: ["bicycles"]
    });

    if (existingUser && existingUser.requestStatus !== "rechazado") {
        throw new Error("Este usuario ya está registrado.");
    }

    // Actualizar usuario rechazado
    if (existingUser && existingUser.requestStatus === "rechazado") {

        Object.assign(existingUser, {
            names: data.names,
            lastName: data.lastName,
            rut: data.rut,
            email: data.email,
            contact: data.contact,
            typePerson: data.typePerson,
            tnePhoto: data.tnePhoto,
            position: data.position,
            positionDescription: data.positionDescription,
            requestStatus: "pendiente",
            password: data.password
                ? await bcrypt.hash(data.password, 10)
                : existingUser.password,
        });

        const updated = await userRepository.save(existingUser);

        const reloaded = await userRepository.findOne({
            where: { id: updated.id },
        });

        await bicycleRepository.delete({ user: { id: reloaded.id } });

        if (data.bicycle) {
            const newBicycle = bicycleRepository.create({
                ...data.bicycle,
                user: reloaded,
            });

            await bicycleRepository.save(newBicycle);
        }

        return reloaded;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = userRepository.create({
        role: "user",
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

// BUSCAR USUARIO POR EMAIL
export async function findUserByEmail(email) {
    return await userRepository.findOne({
        where: { email },
        relations: ["bicycles"], // incluir bicicletas si las tiene
    });
}