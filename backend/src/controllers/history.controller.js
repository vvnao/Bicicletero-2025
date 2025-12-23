// controllers/history.controller.js
'use strict';

import HistoryService from '../services/history.service.js';
import { getRequestInfo } from '../utils/requestInfo.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../Handlers/responseHandlers.js';

export class HistoryController {
    constructor() {
        this.historyService = HistoryService;
    }

    /**
     * Obtener historial completo con filtros
     */
    async getHistory(req, res) {
        try {
            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos para ver el historial');
            }

            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                historyType: req.query.historyType,
                userId: req.query.userId ? parseInt(req.query.userId) : undefined,
                guardId: req.query.guardId ? parseInt(req.query.guardId) : undefined,
                bicycleId: req.query.bicycleId ? parseInt(req.query.bicycleId) : undefined,
                bikerackId: req.query.bikerackId ? parseInt(req.query.bikerackId) : undefined,
                reservationId: req.query.reservationId ? parseInt(req.query.reservationId) : undefined,
                assignmentId: req.query.assignmentId ? parseInt(req.query.assignmentId) : undefined,
                search: req.query.search,
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 50
            };

            const result = await this.historyService.getHistory(filters);
            return handleSuccess(res, 200, 'Historial obtenido exitosamente', result);
        } catch (error) {
            console.error('Error en getHistory:', error);
            return handleErrorServer(res, 500, 'Error al obtener historial', error.message);
        }
    }


    /**
     * Obtener historial completo con filtros
     */
    async getHistory(req, res) {
        try {
            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos para ver el historial');
            }

            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                historyType: req.query.historyType,
                userId: req.query.userId ? parseInt(req.query.userId) : undefined,
                guardId: req.query.guardId ? parseInt(req.query.guardId) : undefined,
                bicycleId: req.query.bicycleId ? parseInt(req.query.bicycleId) : undefined,
                bikerackId: req.query.bikerackId ? parseInt(req.query.bikerackId) : undefined,
                reservationId: req.query.reservationId ? parseInt(req.query.reservationId) : undefined,
                assignmentId: req.query.assignmentId ? parseInt(req.query.assignmentId) : undefined,
                search: req.query.search,
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 50
            };

            const result = await this.historyService.getHistory(filters);
            return handleSuccess(res, 200, 'Historial obtenido exitosamente', result);
        } catch (error) {
            console.error('Error en getHistory:', error);
            return handleErrorServer(res, 500, 'Error al obtener historial', error.message);
        }
    }

   /**
     * Obtener TODOS los registros del historial (sin filtros)
     */
    async getAllHistory(req, res) {
        try {
            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos para ver el historial completo');
            }

            const filters = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 100,
                search: req.query.search,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            const result = await this.historyService.getHistory(filters);
            return handleSuccess(res, 200, 'Historial completo obtenido', result);
        } catch (error) {
            console.error('Error en getAllHistory:', error);
            return handleErrorServer(res, 500, 'Error al obtener historial completo', error.message);
        }
    }

     /**
     * Historial de TODOS los usuarios (general)
     */
    async getAllUserHistory(req, res) {
        try {
            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos para ver el historial general de usuarios');
            }

            const filters = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 50,
                search: req.query.search,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            // Obtener historial sin filtro específico de usuario
            const result = await this.historyService.getHistory(filters);
            return handleSuccess(res, 200, 'Historial general de usuarios obtenido', result);
        } catch (error) {
            console.error('Error en getAllUserHistory:', error);
            return handleErrorServer(res, 500, 'Error al obtener historial general de usuarios', error.message);
        }
    }
      /**
     * Historial de usuario específico
     */
    async getSpecificUserHistory(req, res) {
        try {
            const { userId } = req.params;
            const filters = req.query;

            // Validar permisos para historial específico
            if (req.user.role === 'usuario' && req.user.id !== parseInt(userId)) {
                return handleErrorClient(res, 403, 'Solo puede ver su propio historial');
            }

            if (!['admin', 'guardia', 'usuario'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos');
            }

            const result = await this.historyService.getUserHistory(parseInt(userId), filters);
            return handleSuccess(res, 200, 'Historial de usuario obtenido', result);
        } catch (error) {
            console.error('Error en getSpecificUserHistory:', error);
            return handleErrorServer(res, 500, 'Error al obtener historial de usuario', error.message);
        }
    }

 /**
     * Historial de TODOS los guardias (general)
     */
    async getAllGuardHistory(req, res) {
        try {
            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos para ver el historial general de guardias');
            }

            const filters = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 50,
                search: req.query.search,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            // Obtener historial sin filtro específico de guardia
            const result = await this.historyService.getHistory(filters);
            return handleSuccess(res, 200, 'Historial general de guardias obtenido', result);
        } catch (error) {
            console.error('Error en getAllGuardHistory:', error);
            return handleErrorServer(res, 500, 'Error al obtener historial general de guardias', error.message);
        }
    }

     /**
     * Historial de guardia específico
     */
    async getSpecificGuardHistory(req, res) {
        try {
            const { guardId } = req.params;
            const filters = req.query;

            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos');
            }

            // Si es guardia, solo puede ver su propio historial
            if (req.user.role === 'guardia' && req.user.id !== parseInt(guardId)) {
                return handleErrorClient(res, 403, 'Solo puede ver su propio historial');
            }

            const result = await this.historyService.getGuardHistory(parseInt(guardId), filters);
            return handleSuccess(res, 200, 'Historial de guardia obtenido', result);
        } catch (error) {
            console.error('Error en getSpecificGuardHistory:', error);
            return handleErrorServer(res, 500, 'Error al obtener historial de guardia', error.message);
        }
    }

    /**
     * Historial de TODAS las bicicletas (general)
     */
    async getAllBicycleHistory(req, res) {
        try {
            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos para ver el historial general de bicicletas');
            }

            const filters = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 50,
                search: req.query.search,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            // Obtener historial sin filtro específico de bicicleta
            const result = await this.historyService.getHistory(filters);
            return handleSuccess(res, 200, 'Historial general de bicicletas obtenido', result);
        } catch (error) {
            console.error('Error en getAllBicycleHistory:', error);
            return handleErrorServer(res, 500, 'Error al obtener historial general de bicicletas', error.message);
        }
    }

    /**
     * Historial de bicicleta específica
     */
    async getSpecificBicycleHistory(req, res) {
        try {
            const { bicycleId } = req.params;
            const filters = req.query;

            if (!['admin', 'guardia', 'usuario'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos');
            }

            const result = await this.historyService.getBicycleHistory(parseInt(bicycleId), filters);
            return handleSuccess(res, 200, 'Historial de bicicleta obtenido', result);
        } catch (error) {
            console.error('Error en getSpecificBicycleHistory:', error);
            return handleErrorServer(res, 500, 'Error al obtener historial de bicicleta', error.message);
        }
    }

    /**
     * Historial de TODOS los bicicleteros (general)
     */
    async getAllBikerackHistory(req, res) {
        try {
            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos para ver el historial general de bicicleteros');
            }

            const filters = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 50,
                search: req.query.search,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            // Obtener historial sin filtro específico de bicicletero
            const result = await this.historyService.getHistory(filters);
            return handleSuccess(res, 200, 'Historial general de bicicleteros obtenido', result);
        } catch (error) {
            console.error('Error en getAllBikerackHistory:', error);
            return handleErrorServer(res, 500, 'Error al obtener historial general de bicicleteros', error.message);
        }
    }

    /**
     * Historial de bicicletero específico
     */
    async getSpecificBikerackHistory(req, res) {
        try {
            const { bikerackId } = req.params;
            const filters = req.query;

            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos');
            }

            const result = await this.historyService.getBikerackHistory(parseInt(bikerackId), filters);
            return handleSuccess(res, 200, 'Historial de bicicletero obtenido', result);
        } catch (error) {
            console.error('Error en getSpecificBikerackHistory:', error);
            return handleErrorServer(res, 500, 'Error al obtener historial de bicicletero', error.message);
        }
    }
   
    /**
     * Obtener estadísticas del historial
     */
    async getStatistics(req, res) {
        try {
            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos');
            }

            const { startDate, endDate, groupBy } = req.query;
            
            if (!startDate || !endDate) {
                return handleErrorClient(res, 400, 'Se requieren fechas de inicio y fin');
            }

            const result = await this.historyService.getHistoryStatistics(
                startDate, 
                endDate, 
                groupBy
            );
            
            return handleSuccess(res, 200, 'Estadísticas obtenidas', result);
        } catch (error) {
            console.error('Error en getStatistics:', error);
            return handleErrorServer(res, 500, 'Error al obtener estadísticas', error.message);
        }
    }

    /**
     * Obtener actividad reciente
     */
    async getRecentActivity(req, res) {
        try {
            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos');
            }

            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const activity = await this.historyService.getRecentActivity(limit);
            
            return handleSuccess(res, 200, 'Actividad reciente obtenida', activity);
        } catch (error) {
            console.error('Error en getRecentActivity:', error);
            return handleErrorServer(res, 500, 'Error al obtener actividad', error.message);
        }
    }

    /**
     * Exportar historial
     */
    async exportHistory(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return handleErrorClient(res, 403, 'Solo administradores pueden exportar historial');
            }

            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                historyType: req.query.historyType,
                userId: req.query.userId ? parseInt(req.query.userId) : undefined,
                guardId: req.query.guardId ? parseInt(req.query.guardId) : undefined,
                bicycleId: req.query.bicycleId ? parseInt(req.query.bicycleId) : undefined,
                bikerackId: req.query.bikerackId ? parseInt(req.query.bikerackId) : undefined
            };

            const result = await this.historyService.exportHistory(filters);
            
            // Configurar headers para descarga
            const fileName = `historial-completo-${new Date().toISOString().split('T')[0]}.json`;
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            
            return res.json({
                success: true,
                message: 'Historial exportado exitosamente',
                ...result
            });
        } catch (error) {
            console.error('Error en exportHistory:', error);
            return handleErrorServer(res, 500, 'Error al exportar historial', error.message);
        }
    }

    /**
     * Limpiar historial antiguo
     */
    async cleanHistory(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return handleErrorClient(res, 403, 'Solo administradores pueden limpiar historial');
            }

            const days = req.query.days ? parseInt(req.query.days) : 90;
            const result = await this.historyService.cleanOldHistory(days);
            
            return handleSuccess(res, 200, `Historial limpiado (${result.affected} registros eliminados)`, result);
        } catch (error) {
            console.error('Error en cleanHistory:', error);
            return handleErrorServer(res, 500, 'Error al limpiar historial', error.message);
        }
    }

    /**
     * Registrar evento manualmente (para testing)
     */
    async createHistoryRecord(req, res) {
        try {
            if (!['admin', 'guardia'].includes(req.user.role)) {
                return handleErrorClient(res, 403, 'No tiene permisos para crear registros');
            }

            const requestInfo = getRequestInfo(req);
            const data = {
                historyType: req.body.historyType,
                description: req.body.description,
                details: req.body.details || {},
                userId: req.body.userId,
                guardId: req.body.guardId || req.user.id,
                bicycleId: req.body.bicycleId,
                bikerackId: req.body.bikerackId,
                reservationId: req.body.reservationId,
                spaceId: req.body.spaceId,
                assignmentId: req.body.assignmentId,
                ipAddress: requestInfo.ipAddress,
                userAgent: requestInfo.userAgent
            };

            const record = await this.historyService.logEvent(data);
            return handleSuccess(res, 201, 'Registro histórico creado', record);
        } catch (error) {
            console.error('Error en createHistoryRecord:', error);
            return handleErrorServer(res, 500, 'Error al crear registro', error.message);
        }
    }
}

export default new HistoryController();