// controllers/reports.controller.js
'use strict';

import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { 
    generateWeeklyReportService, 
    getBikerackWeeklyReportService,
    generateRedistributionPlanService,
    executeRedistributionService 
} from "../services/reports.service.js";

// Generar reporte semanal general (solo admin)
export async function generateWeeklyReportController(req, res) {
    try {
        // Solo admin puede generar reportes generales
        if (req.user.role !== 'admin') {
            return handleErrorClient(res, 403, "Solo administradores pueden generar reportes semanales");
        }

        const { weekStart, weekEnd, bikerackId, includeDetails } = req.query;
        
        if (!weekStart || !weekEnd) {
            return handleErrorClient(res, 400, "Se requieren fechas de inicio y fin");
        }

        const result = await generateWeeklyReportService({
            weekStart,
            weekEnd,
            bikerackId: bikerackId ? parseInt(bikerackId) : undefined,
            includeDetails: includeDetails === 'true'
        });
        
        return handleSuccess(res, 200, "Reporte semanal generado exitosamente", result);
    } catch (error) {
        console.error('Error en generateWeeklyReportController:', error);
        return handleErrorServer(res, 500, "Error al generar reporte semanal", error.message);
    }
}

// Obtener reporte semanal de un bicicletero específico (admin y guardia)
export async function getBikerackWeeklyReportController(req, res) {
    try {
        // Admin y guardia pueden ver reportes específicos
        if (req.user.role !== 'admin' && req.user.role !== 'guardia') {
            return handleErrorClient(res, 403, "No tiene permisos para ver reportes");
        }

        const { weekStart, weekEnd } = req.query;
        const { bikerackId } = req.params;
        
        if (!weekStart || !weekEnd) {
            return handleErrorClient(res, 400, "Se requieren fechas de inicio y fin");
        }

        if (!bikerackId || isNaN(bikerackId)) {
            return handleErrorClient(res, 400, "ID de bicicletero inválido");
        }

        const result = await getBikerackWeeklyReportService(
            parseInt(bikerackId),
            weekStart,
            weekEnd
        );
        
        return handleSuccess(res, 200, "Reporte del bicicletero obtenido", result);
    } catch (error) {
        console.error('Error en getBikerackWeeklyReportController:', error);
        return handleErrorServer(res, 500, "Error al obtener reporte del bicicletero", error.message);
    }
}

// Generar plan de redistribución automática (solo admin)
export async function generateRedistributionPlanController(req, res) {
    try {
        // Solo admin puede redistribuir
        if (req.user.role !== 'admin') {
            return handleErrorClient(res, 403, "Solo administradores pueden redistribuir bicicletas");
        }

        const { bikerackId, date, manualOverride = false } = req.body;
        
        if (!bikerackId || isNaN(bikerackId)) {
            return handleErrorClient(res, 400, "ID de bicicletero inválido");
        }

        const result = await generateRedistributionPlanService(
            parseInt(bikerackId),
            date || new Date().toISOString().split('T')[0],
            manualOverride
        );
        
        const message = manualOverride 
            ? 'Plan de redistribución generado para revisión manual' 
            : 'Plan de redistribución automático generado';
            
        return handleSuccess(res, 200, message, result);
    } catch (error) {
        console.error('Error en generateRedistributionPlanController:', error);
        return handleErrorServer(res, 500, "Error al generar plan de redistribución", error.message);
    }
}

// Ejecutar redistribución confirmada (solo admin)
export async function executeRedistributionController(req, res) {
    try {
        // Solo admin puede ejecutar
        if (req.user.role !== 'admin') {
            return handleErrorClient(res, 403, "Solo administradores pueden ejecutar redistribución");
        }

        const { planId, confirm = false, adjustments = [] } = req.body;
        
        if (!planId) {
            return handleErrorClient(res, 400, "Se requiere un plan de redistribución");
        }

        const result = await executeRedistributionService(planId, confirm, adjustments);
        
        if (!confirm) {
            return handleSuccess(res, 200, "Redistribución pendiente de confirmación", {
                planId,
                status: 'pending',
                message: 'Confirme la redistribución para ejecutarla',
                suggestedChanges: result
            });
        }

        return handleSuccess(res, 200, "Redistribución ejecutada exitosamente", {
            planId,
            status: 'executed',
            executedAt: new Date().toISOString(),
            changes: result.changes,
            message: 'Las bicicletas han sido redistribuidas según el plan'
        });
    } catch (error) {
        console.error('Error en executeRedistributionController:', error);
        return handleErrorServer(res, 500, "Error al ejecutar redistribución", error.message);
    }
}