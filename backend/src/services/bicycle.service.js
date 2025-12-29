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

    const count = await bicycleRepository.count({
        where: { user: { id: userId } }
    });
    if (count >= 3) {
        throw new Error("Ya tiene el máximo de 3 bicicletas registradas");
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
    
    const saved = await bicycleRepository.save(newBicycle);
    
    return await bicycleRepository.findOne({
        where: { id: saved.id },
        relations: ['user']
    });
}

export async function getBicyclesServices(userId) {
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

    const bicycles = await bicycleRepository.find({
        where: {
            user: { id: userId }
        },
        relations: ['user'] 
    });

    return bicycles;
}

export async function updateBicyclesServices(userId, data) {
    const { id, color, photo } = data;

    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

    const bicycle = await bicycleRepository.findOne({
        where: {
            id: id,
            user: {
                id: userId
            }
        },
        relations: ['user'] 
    });

    if (!bicycle) return null;

    if (color !== undefined) bicycle.color = color;
    if (photo !== undefined) bicycle.photo = photo;

    const updated = await bicycleRepository.save(bicycle);
  
    return await bicycleRepository.findOne({
        where: { id: updated.id },
        relations: ['user']
    });
}

export async function deleteBicyclesServices(userId, bicycleId) {
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

    const bicycle = await bicycleRepository.findOne({
        where: {
            id: bicycleId,
            user: { id: userId }
        },
        relations: ['user'] 
    });

    if (!bicycle) return false;

    return await bicycleRepository.remove(bicycle);
}