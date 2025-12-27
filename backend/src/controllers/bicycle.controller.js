"use strict";
import { AppDataSource } from "../config/configDb.js";
import BicycleEntity from "../entities/BicycleEntity.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { createBicycleService, updateBicyclesServices, deleteBicyclesServices, getBicyclesServices } from "../services/bicycle.service.js";
import { bicycleValidation } from "../validations/bicycle.validation.js";

export async function createBicycle(req, res) {
    try {
        const { error } = bicycleValidation.validate(req.body);
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
        const userId = req.user.sub;

        const bicycles = await getBicyclesServices(userId);

        if (!bicycles || bicycles.length === 0) {
            handleSuccess(res, 200, "El usuario no tiene bicicletas registradas", bicycles);
        }
        const SeeBicycles = bicycles.map(({ user, ...bike }) => bike);
        return handleSuccess(res, 200, "Bicicleta(s) obtenida(s) exitosamente", SeeBicycles);
    } catch (error) {
        return handleErrorServer(res, 500, "Error del servidor", error);
    }
}
export async function getAllBicycles(req, res) {
    try {
        const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
        const bicycles = await bicycleRepository.find();
        if (!bicycles) {
            handleSuccess(res, 200, "No hay bicicletas registradas", bicycles);
        }
        handleSuccess(res, 200, "Bicicletas obtenidas exitosamente", bicycles);
    } catch (error) {
        handleErrorServer(res, 500, "Error del servidor", error);
    }
}
export async function deleteBicycles(req, res) {
    try {
        const userId = req.user.sub;
        const { id } = req.body;

        const bicycle = await deleteBicyclesServices(userId, id);

        if (!bicycle) {
            return handleErrorClient(res, 404, "Bicicleta no encontrada o no pertenece al usuario");
        }
        return handleSuccess(res, 200, "Bicicleta eliminada exitosamente");
    } catch (error) {
        handleErrorServer(res, 500, "Error del servidor", error);
    }
}
export async function updateBicycles(req, res) {
    try {
        const userId = req.user.sub;
        const data = req.body;

        const updatedBike = await updateBicyclesServices(userId, data);

        if (!updatedBike)
            return handleErrorClient(res, 404, "Bicicleta no encontrada");

        return handleSuccess(res, 200, "Perfil de bicicleta actualizado exitosamente", {
            color: updatedBike.color,
            photo: updatedBike.photo,
        });
    } catch (error) {
        handleErrorServer(res, 500, "Error del servidor", error);
    }
}

export async function getBicyclesByUserId(req, res) {
    try {
        const { id } = req.params;
        const repo = AppDataSource.getRepository(BicycleEntity);

        const bikes = await repo.find({
            where: { user: { id: Number(id) } }
        });

        return res.json({
            message: "Bicicletas obtenidas correctamente",
            data: bikes,
            status: "Success",
        });

    } catch (error) {
        console.error("Error en getBicyclesByUser:", error);
        return res.status(500).json({
            message: "Error al obtener bicicletas del usuario",
            data: [],
            status: "Error",
        });
    }
}
