"use strict"
import { AppDataSource } from "../config/configDb.js"
import { BicycleEntity } from "../entities/BicycleEntity.js"
import { UserEntity } from "../entities/UserEntity.js"

export async function createBicycleService(data, userId){
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
    const userRepository = AppDataSource.getRepository(UserEntity);

    const user = await userRepository.findOneBy({ id: userId });
    if(!user){
        throw new Error("Usuario no encontrado");
    }
    if (data.serialNumber) {
        const existing = await bicycleRepository.findOneBy({ serialNumber: data.serialNumber });
        if (existing) {
            throw new Error("Ya existe una bicicleta con ese número de serie");
        }
    }
    const newBicycle = bicycleRepository.create({
        brand: data.brand,
        model: data.model,
        color: data.color,
        serialNumber: data.serialNumber,
        photo: data.photo || null,
        user: user,
    });
    return await bicycleRepository.save(newBicycle);
}
