// controllers/reports.controller.js - VERSIÓN CORREGIDA DEFINITIVA
'use strict';

import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import reportService from "../services/reports.service.js";

// Tipos de reporte permitidos
const ALLOWED_REPORT_TYPES = [
    'uso_semanal',           // Uso Semanal General
    'capacidad',             // Estado de Capacidad
    'redistribucion',        // Plan de Redistribución
    'actividad_usuarios',    // Actividad de Usuarios (futuro)
    'estado_inventario'      // Estado del Inventario (futuro)
];

// Generar reporte semanal general (solo admin)
export async function generateWeeklyReportController(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return handleErrorClient(res, 403, "Solo administradores pueden generar reportes semanales");
        }

        const { weekStart, weekEnd, bikerackId, reportType = 'uso_semanal' } = req.query;
        
        if (!weekStart || !weekEnd) {
            return handleErrorClient(res, 400, "Se requieren weekStart y weekEnd en formato YYYY-MM-DD");
        }

        console.log('📋 Controlador - Generando reporte:', { weekStart, weekEnd, reportType, bikerackId });

        const userId = req.user.id; // ← OBTENER EL ID DEL USUARIO AUTENTICADO
        let result;

        switch(reportType) {
            case 'uso_semanal':
                result = await reportService.generateAndSaveWeeklyReport({
                    weekStart,
                    weekEnd,
                    reportType,
                    bikerackId: bikerackId ? parseInt(bikerackId) : undefined,
                    generatedByUserId: userId // ← ¡PASAR EL USER ID!
                });
                break;

            case 'capacidad':
                // Este método NO guarda en la tabla reports, solo devuelve datos
                result = await reportService.checkCapacityIssues(
                    bikerackId ? parseInt(bikerackId) : undefined
                );
                break;

            case 'redistribucion':
                if (!bikerackId) {
                    return handleErrorClient(res, 400, "Se requiere bikerackId para generar plan de redistribución");
                }
                result = await reportService.generateRedistributionPlan(
                    parseInt(bikerackId),
                    userId // ← ¡PASAR EL USER ID!
                );
                break;

            default:
                return handleErrorClient(res, 400, `Tipo de reporte no implementado: ${reportType}`);
        }
        
        return handleSuccess(res, 200, "Reporte generado exitosamente", result);
    } catch (error) {
        console.error('❌ Error en generateWeeklyReportController:', error);
        return handleErrorServer(res, 500, "Error al generar reporte", error.message);
    }
}
// Obtener reporte semanal de un bicicletero específico (admin y guardia)
export async function getBikerackWeeklyReportController(req, res) {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'guardia') {
            return handleErrorClient(res, 403, "No tiene permisos para ver reportes");
        }

        const { weekStart, weekEnd, reportType = 'uso_semanal' } = req.query;
        const { bikerackId } = req.params;
        
        if (!weekStart || !weekEnd) {
            return handleErrorClient(res, 400, "Se requieren weekStart y weekEnd");
        }

        if (!bikerackId || isNaN(bikerackId)) {
            return handleErrorClient(res, 400, "ID de bicicletero inválido");
        }

        console.log('📋 Controlador - Reporte de bicicletero:', { bikerackId, weekStart, weekEnd, reportType });

        const userId = req.user.id;
        let result;

        switch(reportType) {
            case 'uso_semanal':
                result = await reportService.generateAndSaveWeeklyReport({
                    weekStart,
                    weekEnd,
                    reportType,
                    bikerackId: parseInt(bikerackId),
                    generatedByUserId: userId
                });
                break;

            case 'capacidad':
                result = await reportService.checkCapacityIssues(parseInt(bikerackId));
                break;

            case 'redistribucion':
                result = await reportService.generateRedistributionPlan(
                    parseInt(bikerackId),
                    userId
                );
                break;

            default:
                return handleErrorClient(res, 400, `Tipo de reporte no disponible para bicicletero específico: ${reportType}`);
        }
        
        return handleSuccess(res, 200, "Reporte del bicicletero obtenido", result);
    } catch (error) {
        console.error('❌ Error en getBikerackWeeklyReportController:', error);
        return handleErrorServer(res, 500, "Error al obtener reporte del bicicletero", error.message);
    }
}

/**
 * Reporte de auditoría/consistencia
 */
export async function generateAuditReportController(req, res) {
    try {
        // Solo admin puede generar reportes de auditoría
        if (req.user.role !== 'admin') {
            return handleErrorClient(res, 403, "Solo administradores pueden generar reportes de auditoría");
        }

        const { 
            weekStart, 
            weekEnd, 
            bikerackId 
        } = req.query;
        
        // Validar parámetros requeridos
        if (!weekStart || !weekEnd) {
            return handleErrorClient(res, 400, 
                "Se requieren weekStart y weekEnd en formato YYYY-MM-DD. Ej: weekStart=2024-11-01&weekEnd=2024-11-07"
            );
        }

        console.log('🔍 Generando reporte de auditoría:', { weekStart, weekEnd, bikerackId });

        // Generar reporte de auditoría
        const auditReport = await reportService.generateAuditReport(
            weekStart,
            weekEnd,
            bikerackId ? parseInt(bikerackId) : undefined
        );

        return handleSuccess(res, 200, 
            auditReport.summary.issuesFound > 0 
                ? `Auditoría completada - Se encontraron ${auditReport.summary.issuesFound} problema(s)` 
                : "Auditoría completada - Todo en orden",
            auditReport
        );
    } catch (error) {
        console.error('❌ Error en generateAuditReportController:', error);
        return handleErrorServer(res, 500, "Error al generar reporte de auditoría", error.message);
    }
}

// NUEVO: Obtener historial de reportes generados
export async function getReportsHistoryController(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return handleErrorClient(res, 403, "Solo administradores pueden ver el historial de reportes");
        }

        const filters = {
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 20,
            reportType: req.query.reportType,
            status: req.query.status,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            bikerackId: req.query.bikerackId ? parseInt(req.query.bikerackId) : undefined
        };

        const result = await reportService.getReportHistory(filters);
        return handleSuccess(res, 200, "Historial de reportes obtenido", result);
    } catch (error) {
        console.error('❌ Error en getReportsHistoryController:', error);
        return handleErrorServer(res, 500, "Error al obtener historial de reportes", error.message);
    }
}

