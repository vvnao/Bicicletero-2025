// controllers/history.controller.js
'use strict';

import { AppDataSource } from "../config/configDb.js";
import { HistoryEntity } from "../entities/HistoryEntity.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { getHistoryService, getStatisticsService, exportHistoryService } from "../services/history.service.js";

// Obtener historial con filtros
export async function getHistoryController(req, res) {
    try {
        // Validar permisos
        if (req.user.role !== 'admin' && req.user.role !== 'guardia') {
            return handleErrorClient(res, 403, "No tiene permisos para ver el historial");
        }

        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            userId: req.query.userId ? parseInt(req.query.userId) : undefined,
            bicycleId: req.query.bicycleId ? parseInt(req.query.bicycleId) : undefined,
            bikerackId: req.query.bikerackId ? parseInt(req.query.bikerackId) : undefined,
            guardId: req.query.guardId ? parseInt(req.query.guardId) : undefined,
            movementType: req.query.movementType,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 50
        };

        const result = await getHistoryService(filters);
        return handleSuccess(res, 200, "Historial obtenido exitosamente", result);
    } catch (error) {
        console.error('Error en getHistoryController:', error);
        return handleErrorServer(res, 500, "Error al obtener historial", error.message);
    }
}

// Obtener estadísticas del historial
export async function getHistoryStatisticsController(req, res) {
    try {
        // Validar permisos
        if (req.user.role !== 'admin' && req.user.role !== 'guardia') {
            return handleErrorClient(res, 403, "No tiene permisos para ver estadísticas");
        }

        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return handleErrorClient(res, 400, "Se requieren fechas de inicio y fin");
        }

        const result = await getStatisticsService(startDate, endDate);
        return handleSuccess(res, 200, "Estadísticas obtenidas exitosamente", result);
    } catch (error) {
        console.error('Error en getHistoryStatisticsController:', error);
        return handleErrorServer(res, 500, "Error al obtener estadísticas", error.message);
    }
}

// Exportar historial (solo admin)
export async function exportHistoryController(req, res) {
    try {
        // Solo administradores pueden exportar
        if (req.user.role !== 'admin') {
            return handleErrorClient(res, 403, "Solo administradores pueden exportar historial");
        }

        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            userId: req.query.userId ? parseInt(req.query.userId) : undefined,
            bicycleId: req.query.bicycleId ? parseInt(req.query.bicycleId) : undefined,
            bikerackId: req.query.bikerackId ? parseInt(req.query.bikerackId) : undefined,
            guardId: req.query.guardId ? parseInt(req.query.guardId) : undefined,
            movementType: req.query.movementType
        };

        const result = await exportHistoryService(filters);
        
        // Configurar headers para descarga
        const fileName = `historial-${new Date().toISOString().split('T')[0]}.json`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        return res.json({
            success: true,
            message: "Historial exportado exitosamente",
            ...result
        });
    } catch (error) {
        console.error('Error en exportHistoryController:', error);
        return handleErrorServer(res, 500, "Error al exportar historial", error.message);
    }
}