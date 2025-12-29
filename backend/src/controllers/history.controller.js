// controllers/history.controller.js
'use strict';

import historyService from '../services/history.service.js';
import { getRequestInfo } from '../utils/requestInfo.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../Handlers/responseHandlers.js';

export class HistoryController {
    constructor() {
        this.historyService = historyService;

        // 🔑 BINDEAR MÉTODOS
       this.getHistory = this.getHistory.bind(this);
       this.getBicycleUsage = this.getBicycleUsage.bind(this);
       this.getManagementMovements = this.getManagementMovements.bind(this);
        this.getAllUserHistory = this.getAllUserHistory.bind(this);
        this.getSpecificUserHistory = this.getSpecificUserHistory.bind(this);
        this.getGuardsHistory = this.getGuardsHistory.bind(this);
        this.getSpecificGuardHistory = this.getSpecificGuardHistory.bind(this);
        this.getAllBicycleHistory = this.getAllBicycleHistory.bind(this);
        this.getSpecificBicycleHistory = this.getSpecificBicycleHistory.bind(this);
        this.getStatistics = this.getStatistics.bind(this);
        this.getRecentActivity = this.getRecentActivity.bind(this);
        this.exportHistory = this.exportHistory.bind(this);
        this.cleanHistory = this.cleanHistory.bind(this);
        this.createHistoryRecord = this.createHistoryRecord.bind(this);
    }

    /**
     * Obtener historial completo con filtros
     */
   async getHistory(req, res) {
    try {
        console.log('📋 [getHistory CONTROLADOR] Iniciando...');
        console.log('📋 Usuario:', req.user.email, 'Rol:', req.user.role);
        
        if (!['admin', 'guardia'].includes(req.user.role)) {
            console.log('❌ Usuario sin permisos');
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

        console.log('📋 Filtros procesados:', JSON.stringify(filters, null, 2));

        console.log('📋 Llamando a historyService.getHistory()...');
        const result = await this.historyService.getHistory(filters);
        
        console.log('📋 Resultado del servicio:', {
            resultExists: !!result,
            resultType: typeof result,
            resultKeys: result ? Object.keys(result) : 'result is null/undefined',
            hasData: result?.data !== undefined,
            dataIsArray: Array.isArray(result?.data),
            dataLength: result?.data?.length || 0,
            hasPagination: result?.pagination !== undefined
        });
        
        if (!result) {
            console.log('❌ El servicio devolvió null/undefined');
            return handleSuccess(res, 200, 'Historial obtenido exitosamente', {
                data: [],
                pagination: {
                    page: 1,
                    limit: 50,
                    total: 0,
                    totalPages: 0
                }
            });
        }

        console.log('✅ Enviando respuesta al cliente');
        return handleSuccess(res, 200, 'Historial obtenido exitosamente', result);
    } catch (error) {
        console.error('❌ [getHistory CONTROLADOR] Error:', error.message);
        console.error('❌ Stack:', error.stack);
        return handleErrorServer(res, 500, 'Error al obtener historial', error.message);
    }
}

async getManagementMovements(req, res) {
  try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Llamamos al servicio con los nombres de columna correctos
        const result = await this.historyService.getAdminManagementHistory(page, limit);
        
        return handleSuccess(res, 200, "Movimientos de gestión obtenidos", result);
    } catch (error) {
        // Esto te ayudará a ver si hay otro nombre de columna mal en la consola
        console.error("Detalle del error en el controlador:", error);
        return handleErrorServer(res, 500, "Error al obtener movimientos", error.message);
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

    async getRegistrationHistory(req, res) {
    try {
        // Solo traemos eventos que afectan el ciclo de vida del usuario
        const result = await this.historyService.getHistory({
            historyType: HISTORY_GROUPS.USER_MANAGEMENT,
            page: req.query.page || 1,
            limit: 20
        });

        return handleSuccess(res, 200, 'Historial de registros y cuentas obtenido', result);
    } catch (error) {
        return handleErrorServer(res, 500, 'Error al filtrar historial de usuarios', error.message);
    }
} 

 /**
     * Historial de TODOS los guardias (general)
     */
async getGuardsHistory(req, res) {
    try {
        const filters = {
            ...req.query,
            onlyGuards: true 
        };

        const result = await historyService.getHistory(filters);
        
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
                endDate: req.query.endDate,
                historyType: req.query.historyType // Permitir filtrar por tipo
            };

            // Obtener historial específico de bicicleteros
            const result = await this.historyService.getBikerackHistory(null, filters);
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
            
            // Validamos que sea uno de tus 4 bicicleteros (ID del 1 al 4)
            const idNum = parseInt(bikerackId);
            if (isNaN(idNum) || idNum < 1 || idNum > 4) {
                return handleErrorClient(res, 400, "ID de bicicletero inválido. Solo existen 4.");
            }

            const filters = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };

            // Llamamos al servicio (asegúrate que historyService esté importado arriba)
            const result = await historyService.getBikerackHistory(idNum, filters);
            
            return handleSuccess(res, 200, 'Historial obtenido correctamente', result);
        } catch (error) {
            return handleErrorServer(res, 500, 'Error en el servidor', error.message);
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

    async getBicycleUsage(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Llamamos al servicio que configuramos antes
        const result = await this.historyService.getBikerackUsageHistory(page, limit);
        
        return handleSuccess(res, 200, "Historial de uso de espacios obtenido", result);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener historial de ocupación", error.message);
    }
}
    /**
     * Obtener actividad reciente*/
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