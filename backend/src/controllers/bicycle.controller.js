"use strict";
import { AppDataSource } from "../config/configDb.js";
import BicycleEntity from "../entities/BicycleEntity.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { createBicycleService } from "../services/bicycle.service.js";
import { bicycleValidation } from "../validations/bicycle.validation.js";

export async function createBicycle(req, res) {
    try {
        const { error }= bicycleValidation.validate(req.body);
        if (error) {
            const mensaje = error.details[0].message;
            return handleErrorClient(res, 400, mensaje);
        }
        const userId = req.user?.sub;
        if (!userId) {
            return handleErrorClient(res, 401, "Usuario no autenticado");
        }
        const newBicycle = await createBicycleService(req.body, userId);
        handleSuccess(res, 201, "Bicicleta creada exitosamente", newBicycle);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
export async function getBicycles(req, res) {
    try {
        const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

        const userId = req.user.sub;
        const bicycles = await bicycleRepository.find({ where:{ user: {id: userId}} });
        if (!bicycles || bicycles.length === 0){
        handleSuccess(res, 200, "El usuario no tiene bicicletas registradas",bicycles);
        }

        handleSuccess(res,200,"Bicicleta(s) obtenida(s) exitosamente",bicycles);
    } catch (error) {
        return handleErrorServer(res, 500, "Error del servidor", error);
    }
}
export async function getAllBicycles(req, res){
    try{
        const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
        const bicycles = await bicycleRepository.find();
        if (!bicycles) {
            handleSuccess(res, 200, "No hay bicicletas registradas", bicycles);
        }
        handleSuccess(res, 200, "Bicicletas obtenidas exitosamente", bicycles );
    }catch(error) {
        handleErrorServer(res,500,"Error del servidor",error);
    }
}

