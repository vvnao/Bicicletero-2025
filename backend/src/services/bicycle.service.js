"use strict"
import { AppDataSource } from "../config/configDb.js"
import { BicycleEntity } from "../entities/BicycleEntity.js"
import { UserEntity } from "../entities/UserEntity.js"

export async function createBicycleService(data, userId){
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
    const userRepository = AppDataSource.getRepository(UserEntity);

    const user = await userRepository.findOneBy({ id: userId });
    if(!user) throw new Error("Usuario no encontrado");

    const count = await bicycleRepository.count({ 
        where: { 
            user: { id: userId },
            active: true 
        } 
    });
    if (count >= 3) throw new Error("Ya tiene el máximo de 3 bicicletas registradas");

    const newBicycle = bicycleRepository.create({
        ...data,
        user: user,
    });
    
    return await bicycleRepository.save(newBicycle);
}

export async function getBicyclesServices(userId) {
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
    return await bicycleRepository.find({
        where: { user: { id: userId }, active: true },
        relations: ['user'], 
    });
}

export async function updateBicyclesServices(userId, data) {
    const { id, color, photo } = data;
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
    const bicycle = await bicycleRepository.findOne({
        where: { id: id, user: { id: userId } }
    });

    if (!bicycle) return null;
    if (color !== undefined) bicycle.color = color;
    if (photo !== undefined) bicycle.photo = photo;

    return await bicycleRepository.save(bicycle);
}

// ESTA ES LA QUE FALTABA SEGÚN TU ERROR DE SYNTAX
export async function deleteBicyclesServices(userId, bicycleId) {
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
    const bicycle = await bicycleRepository.findOne({
        where: { id: bicycleId, user: { id: userId } }
    });
    if (!bicycle) return false;
    return await bicycleRepository.remove(bicycle);
}

export async function deleteBicyclesServicesSoft(userId, bicycleId) {
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
    const bicycle = await bicycleRepository.findOne({
        where: { id: bicycleId, user: { id: userId } }
    });
    if (!bicycle) return false;
    bicycle.active = false; 
    return await bicycleRepository.save(bicycle);
}