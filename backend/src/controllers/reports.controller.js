// controllers/reports.controller.js - VERSIÓN CORREGIDA
'use strict';

import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { 
    generateWeeklyReportService, 
    getBikerackWeeklyReportService
} from "../services/reports.service.js"; // ¡IMPORTANTE: Este debe apuntar al archivo correcto!

// Tipos de reporte permitidos
const ALLOWED_REPORT_TYPES = [
    'uso_bicicletas',      // Uso de Bicicletas
    'ingresos_retiros',    // Ingresos/Réticos
    'estado_inventario',   // Estado del Inventario
    'actividad_usuarios',  // Actividad de Usuarios
    'turnos_guardias'      // Turnos de Guardias
];

// Generar reporte semanal general (solo admin)
export async function generateWeeklyReportController(req, res) {
    try {
        // Solo admin puede generar reportes generales
        if (req.user.role !== 'admin') {
            return handleErrorClient(res, 403, "Solo administradores pueden generar reportes semanales");
        }

        // Obtener parámetros de la query
        const { 
            weekStart, 
            weekEnd, 
            bikerackId, 
            reportType = 'uso_bicicletas', // Valor por defecto
            includeDetails 
        } = req.query;
        
        // Validar parámetros requeridos
        if (!weekStart || !weekEnd) {
            return handleErrorClient(res, 400, "Se requieren weekStart y weekEnd en formato YYYY-MM-DD");
        }

        // Validar tipo de reporte
        if (!ALLOWED_REPORT_TYPES.includes(reportType)) {
            return handleErrorClient(res, 400, `Tipo de reporte inválido. Tipos permitidos: ${ALLOWED_REPORT_TYPES.join(', ')}`);
        }

        console.log('📋 Controlador - Parámetros recibidos:', {
            weekStart,
            weekEnd,
            reportType,
            bikerackId,
            includeDetails
        });

        // Llamar al servicio (IMPORTANTE: debe estar en otro archivo)
        const result = await generateWeeklyReportService({
            weekStart,
            weekEnd,
            reportType,
            bikerackId: bikerackId ? parseInt(bikerackId) : undefined,
            includeDetails: includeDetails === 'true'
        });
        
        return handleSuccess(res, 200, "Reporte semanal generado exitosamente", result);
    } catch (error) {
        console.error('❌ Error en generateWeeklyReportController:', error);
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

        // Obtener parámetros
        const { 
            weekStart, 
            weekEnd, 
            reportType = 'uso_bicicletas' 
        } = req.query;
        
        const { bikerackId } = req.params;
        
        if (!weekStart || !weekEnd) {
            return handleErrorClient(res, 400, "Se requieren weekStart y weekEnd en formato YYYY-MM-DD");
        }

        if (!bikerackId || isNaN(bikerackId)) {
            return handleErrorClient(res, 400, "ID de bicicletero inválido");
        }

        // Validar tipo de reporte
        if (!ALLOWED_REPORT_TYPES.includes(reportType)) {
            return handleErrorClient(res, 400, `Tipo de reporte inválido. Tipos permitidos: ${ALLOWED_REPORT_TYPES.join(', ')}`);
        }

        console.log('📋 Controlador - Parámetros recibidos:', {
            bikerackId,
            weekStart,
            weekEnd,
            reportType
        });

        const result = await getBikerackWeeklyReportService(
            parseInt(bikerackId),
            weekStart,
            weekEnd,
            reportType
        );
        
        return handleSuccess(res, 200, "Reporte del bicicletero obtenido", result);
    } catch (error) {
        console.error('❌ Error en getBikerackWeeklyReportController:', error);
        return handleErrorServer(res, 500, "Error al obtener reporte del bicicletero", error.message);
    }
}

