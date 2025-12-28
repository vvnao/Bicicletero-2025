// controllers/bicycle.controller.js - CON HISTORIAL
"use strict";

import { AppDataSource } from "../config/configDb.js";
import BicycleEntity from "../entities/BicycleEntity.js";
import HistoryService from "../services/history.service.js"; // ← IMPORTAR
import { 
    handleSuccess, 
    handleErrorClient, 
    handleErrorServer 
} from "../Handlers/responseHandlers.js";
import { 
    createBicycleService, 
    getBicyclesServices, 
    updateBicyclesServices, 
    deleteBicyclesServices 
} from "../services/bicycle.service.js";
import { bicycleValidation } from "../validations/bicycle.validation.js";

export async function createBicycle(req, res) {
    try {
        console.log('🚲 [createBicycle] Iniciando creación de bicicleta...');
        
        const { error } = bicycleValidation.validate(req.body);
        if (error) {
            const mensaje = error.details[0].message;
            console.log('❌ Validación falló:', mensaje);
            return handleErrorClient(res, 400, mensaje);
        }
        
        const userId = req.user?.id;
        if (!userId) {
            console.log('❌ Usuario no autenticado');
            return handleErrorClient(res, 401, "Usuario no autenticado");
        }
        
        console.log('🚲 Datos recibidos:', req.body);
        console.log('🚲 Usuario ID:', userId);
        
        // 1. Crear la bicicleta (servicio)
        const newBicycle = await createBicycleService(req.body, userId);
        console.log('✅ Bicicleta creada ID:', newBicycle.id);
        
        // 🟢 2. REGISTRAR EN HISTORIAL (después de crear exitosamente)
        try {
            console.log('📝 Registrando en historial...');
            await HistoryService.logEvent({
                historyType: 'bicycle_registration',
                description: `Nueva bicicleta registrada: ${newBicycle.brand} ${newBicycle.model}`,
                details: {
                    bicycleId: newBicycle.id,
                    brand: newBicycle.brand,
                    model: newBicycle.model,
                    color: newBicycle.color,
                    serialNumber: newBicycle.serialNumber,
                    userId: userId,
                    userEmail: req.user.email,
                    userNames: req.user.names,
                    timestamp: new Date().toISOString()
                },
                bicycleId: newBicycle.id,
                userId: userId,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });
            console.log('✅ Historial registrado exitosamente');
        } catch (histError) {
            console.error('⚠️ Error registrando historial (continuando...):', histError);
            // Continuar aunque falle el historial
        }
        
        handleSuccess(res, 201, "Bicicleta creada exitosamente", newBicycle);
    } catch (error) {
        console.error('❌ Error en createBicycle:', error.message);
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteBicycles(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.body;

        console.log('🚲 [deleteBicycle] Eliminando bicicleta ID:', id, 'del usuario ID:', userId);
        
        if (!id) {
            console.log('❌ ID de bicicleta no proporcionado');
            return handleErrorClient(res, 400, "ID de bicicleta requerido");
        }

        // Obtener info de la bicicleta antes de eliminar
        const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
        const bicycle = await bicycleRepository.findOne({
            where: { id: id, user: { id: userId } },
            relations: ['user']
        });

        if (!bicycle) {
            console.log('❌ Bicicleta no encontrada o no pertenece al usuario');
            return handleErrorClient(res, 404, "Bicicleta no encontrada o no pertenece al usuario");
        }

        console.log('📝 Bicicleta a eliminar:', {
            id: bicycle.id,
            brand: bicycle.brand,
            model: bicycle.model,
            owner: bicycle.user ? `${bicycle.user.names} ${bicycle.user.lastName}` : 'N/A'
        });

        // 🟢 1. REGISTRAR EN HISTORIAL ANTES DE ELIMINAR
        try {
            console.log('📝 Registrando eliminación en historial...');
            await HistoryService.logEvent({
                historyType: 'bicycle_deleted',
                description: `Bicicleta eliminada: ${bicycle.brand} ${bicycle.model}`,
                details: {
                    bicycleId: bicycle.id,
                    brand: bicycle.brand,
                    model: bicycle.model,
                    color: bicycle.color,
                    serialNumber: bicycle.serialNumber,
                    userId: userId,
                    userEmail: req.user.email,
                    userNames: req.user.names,
                    deletedAt: new Date().toISOString(),
                    deletedBy: req.user.id
                },
                bicycleId: bicycle.id,
                userId: userId,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });
            console.log('✅ Historial de eliminación registrado');
        } catch (histError) {
            console.error('⚠️ Error registrando historial de eliminación:', histError);
        }

        // 2. Eliminar la bicicleta (servicio)
        await deleteBicyclesServices(userId, id);
        
        console.log('✅ Bicicleta eliminada exitosamente');
        
        return handleSuccess(res, 200, "Bicicleta eliminada exitosamente", {
            id: id,
            message: 'Bicicleta eliminada'
        });
    } catch (error) {
        console.error('❌ Error en deleteBicycles:', error);
        handleErrorServer(res, 500, "Error del servidor", error);
    }
}
export async function getBicycles(req, res) {
    try {
        const userId = req.user.id;
        
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
export async function updateBicycles(req, res) {
    try {
        const userId = req.user.id;
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
