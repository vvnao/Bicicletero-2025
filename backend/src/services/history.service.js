// services/history.service.js - VERSIÓN CORREGIDA CON TODAS LAS EXPORTACIONES
'use strict';

import { AppDataSource } from "../config/configDb.js";
import { HistoryEntity } from "../entities/HistoryEntity.js";

// Definir HISTORY_TYPES
const HISTORY_TYPES = {
    USER_CHECKIN: 'user_checkin',
    USER_CHECKOUT: 'user_checkout',
    USER_REGISTRATION_REQUEST: 'user_registration_request',
    USER_STATUS_CHANGE: 'user_status_change',
    GUARD_ASSIGNMENT: 'guard_assignment',
    GUARD_SHIFT_START: 'guard_shift_start',
    GUARD_SHIFT_END: 'guard_shift_end',
    RESERVATION_CREATE: 'reservation_create',
    RESERVATION_CANCEL: 'reservation_cancel',
    RESERVATION_ACTIVATE: 'reservation_activate',
    RESERVATION_COMPLETE: 'reservation_complete',
    BICYCLE_REGISTRATION: 'bicycle_registration',
    INFRACTION: 'infraction',
    SYSTEM_NOTIFICATION: 'system_notification',
    ADMIN_ACTION: 'admin_action'
};

class HistoryService {
    constructor() {
        this.historyRepository = AppDataSource.getRepository(HistoryEntity);
    }

    // ================================================
    // MÉTODOS PARA REGISTRAR EVENTOS
    // ================================================

    /**
     * Registrar evento genérico en historial
     */
    async createHistoryRecord(eventData) {
        try {
            console.log('📝 Registrando evento:', eventData.historyType);
            
            const history = this.historyRepository.create({
                historyType: eventData.historyType,
                description: eventData.description,
                details: eventData.details || {},
                timestamp: new Date(),
                ipAddress: eventData.ipAddress,
                userAgent: eventData.userAgent,
                // Relaciones
                user: eventData.userId ? { id: eventData.userId } : null,
                guard: eventData.guardId ? { id: eventData.guardId } : null,
                bicycle: eventData.bicycleId ? { id: eventData.bicycleId } : null,
                bikerack: eventData.bikerackId ? { id: eventData.bikerackId } : null,
                reservation: eventData.reservationId ? { id: eventData.reservationId } : null,
                space: eventData.spaceId ? { id: eventData.spaceId } : null,
                assignment: eventData.assignmentId ? { id: eventData.assignmentId } : null
            });

            const savedHistory = await this.historyRepository.save(history);
            console.log('✅ Evento registrado:', savedHistory.id);
            return savedHistory;
        } catch (error) {
            console.error('❌ Error registrando evento:', error);
            throw error;
        }
    }

    /**
 * Obtener historial general formateado para tabla
 */
async getGeneralHistoryTable(filters = {}) {
    try {
        const {
            page = 1,
            limit = 50,
            search,
            startDate,
            endDate,
            historyType,
            sortBy = 'timestamp',
            sortOrder = 'DESC'
        } = filters;

        const skip = (page - 1) * limit;
        
        const query = this.historyRepository.createQueryBuilder('history')
            .leftJoinAndSelect('history.user', 'user')
            .leftJoinAndSelect('history.guard', 'guard')
            .leftJoinAndSelect('history.bicycle', 'bicycle')
            .leftJoinAndSelect('history.bikerack', 'bikerack')
            .orderBy(`history.${sortBy}`, sortOrder);

        // Aplicar filtros básicos
        if (startDate && endDate) {
            query.andWhere('DATE(history.timestamp) BETWEEN :startDate AND :endDate', {
                startDate,
                endDate
            });
        }

        if (historyType) {
            query.andWhere('history.historyType = :historyType', { historyType });
        }

        if (search) {
            query.andWhere(
                '(history.description LIKE :search OR ' +
                'user.names LIKE :search OR ' +
                'user.lastName LIKE :search OR ' +
                'guard.names LIKE :search OR ' +
                'guard.lastName LIKE :search OR ' +
                'bicycle.brand LIKE :search OR ' +
                'bicycle.model LIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Obtener datos paginados
        const [data, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        // Formatear específicamente para tabla
        const tableData = data.map(item => ({
            id: item.id,
            fecha: new Date(item.timestamp).toLocaleDateString('es-CL'),
            hora: new Date(item.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
            tipo: item.historyType,
            descripcion: item.description,
            usuario: item.user ? `${item.user.names} ${item.user.lastName}` : 'N/A',
            guardia: item.guard ? `${item.guard.names} ${item.guard.lastName}` : 'N/A',
            bicicleta: item.bicycle ? `${item.bicycle.brand} ${item.bicycle.model}` : 'N/A',
            bicicletero: item.bikerack?.name || 'N/A',
            detalles: item.details ? JSON.stringify(item.details) : null
        }));

        return {
            data: tableData,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                sortBy,
                sortOrder
            }
        };
    } catch (error) {
        console.error('Error obteniendo tabla general:', error);
        throw error;
    }
}

    /**
     * Alias para logEvent (para mantener compatibilidad)
     */
    async logEvent(eventData) {
        return this.createHistoryRecord(eventData);
    }

    /**
     * Registrar check-in de usuario
     */
    async logUserCheckIn(data) {
        return this.createHistoryRecord({
            historyType: HISTORY_TYPES.USER_CHECKIN,
            description: `Check-in realizado por usuario`,
            details: {
                spaceCode: data.spaceCode,
                bikerackName: data.bikerackName,
                estimatedHours: data.estimatedHours,
                method: data.withReservation ? 'con_reserva' : 'sin_reserva',
                reservationCode: data.reservationCode
            },
            userId: data.userId,
            bicycleId: data.bicycleId,
            bikerackId: data.bikerackId,
            spaceId: data.spaceId,
            reservationId: data.reservationId,
            guardId: data.guardId,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent
        });
    }

    /**
     * Registrar check-out de usuario
     */
    async logUserCheckOut(data) {
        return this.createHistoryRecord({
            historyType: HISTORY_TYPES.USER_CHECKOUT,
            description: `Check-out realizado por usuario`,
            details: {
                spaceCode: data.spaceCode,
                bikerackName: data.bikerackName,
                actualHours: data.actualHours,
                status: data.status
            },
            userId: data.userId,
            bicycleId: data.bicycleId,
            bikerackId: data.bikerackId,
            spaceId: data.spaceId,
            reservationId: data.reservationId,
            guardId: data.guardId,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent
        });
    }

    /**
     * Registrar infracción
     */
    async logInfraction(data) {
        return this.createHistoryRecord({
            historyType: HISTORY_TYPES.INFRACTION,
            description: `Infracción detectada`,
            details: {
                spaceCode: data.spaceCode,
                exceededHours: data.exceededHours,
                estimatedHours: data.estimatedHours,
                reservationCode: data.reservationCode,
                reason: data.reason || 'Tiempo excedido'
            },
            userId: data.userId,
            bicycleId: data.bicycleId,
            bikerackId: data.bikerackId,
            spaceId: data.spaceId,
            reservationId: data.reservationId,
            guardId: data.guardId,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent
        });
    }

    // ================================================
    // MÉTODOS PARA CONSULTAR HISTORIAL
    // ================================================

    /**
     * Obtener historial con filtros
     */
    async getHistory(filters = {}) {
        try {
            const {
                startDate,
                endDate,
                historyType,
                userId,
                guardId,
                bicycleId,
                bikerackId,
                reservationId,
                assignmentId,
                page = 1,
                limit = 50,
                search
            } = filters;

            const skip = (page - 1) * limit;
            
            const query = this.historyRepository.createQueryBuilder('history')
                .leftJoinAndSelect('history.user', 'user')
                .leftJoinAndSelect('history.guard', 'guard')
                .leftJoinAndSelect('history.bicycle', 'bicycle')
                .leftJoinAndSelect('history.bikerack', 'bikerack')
                .leftJoinAndSelect('history.reservation', 'reservation')
                .leftJoinAndSelect('history.space', 'space')
                .leftJoinAndSelect('history.assignment', 'assignment')
                .orderBy('history.timestamp', 'DESC');

            // Aplicar filtros
            if (startDate && endDate) {
                query.andWhere('DATE(history.timestamp) BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate
                });
            } else if (startDate) {
                query.andWhere('DATE(history.timestamp) >= :startDate', { startDate });
            } else if (endDate) {
                query.andWhere('DATE(history.timestamp) <= :endDate', { endDate });
            }

            if (historyType) query.andWhere('history.historyType = :historyType', { historyType });
            if (userId) query.andWhere('history.userId = :userId', { userId });
            if (guardId) query.andWhere('history.guardId = :guardId', { guardId });
            if (bicycleId) query.andWhere('history.bicycleId = :bicycleId', { bicycleId });
            if (bikerackId) query.andWhere('history.bikerackId = :bikerackId', { bikerackId });
            if (reservationId) query.andWhere('history.reservationId = :reservationId', { reservationId });
            if (assignmentId) query.andWhere('history.assignmentId = :assignmentId', { assignmentId });

            if (search) {
                query.andWhere(
                    '(history.description LIKE :search OR user.names LIKE :search OR user.lastName LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            // Obtener datos paginados
            const [data, total] = await query
                .skip(skip)
                .take(limit)
                .getManyAndCount();

            // Formatear respuesta
            const formattedData = data.map(item => ({
                id: item.id,
                timestamp: item.timestamp,
                historyType: item.historyType,
                description: item.description,
                details: item.details,
                user: item.user ? {
                    id: item.user.id,
                    names: item.user.names,
                    lastName: item.user.lastName,
                    email: item.user.email,
                    role: item.user.role
                } : null,
                guard: item.guard ? {
                    id: item.guard.id,
                    names: item.guard.names,
                    lastName: item.guard.lastName,
                    role: item.guard.role
                } : null,
                bicycle: item.bicycle ? {
                    id: item.bicycle.id,
                    brand: item.bicycle.brand,
                    model: item.bicycle.model,
                    color: item.bicycle.color
                } : null,
                bikerack: item.bikerack ? {
                    id: item.bikerack.id,
                    name: item.bikerack.name,
                    location: item.bikerack.location
                } : null,
                reservation: item.reservation ? {
                    id: item.reservation.id,
                    reservationCode: item.reservation.reservationCode,
                    status: item.reservation.status
                } : null,
                space: item.space ? {
                    id: item.space.id,
                    spaceCode: item.space.spaceCode
                } : null,
                assignment: item.assignment ? {
                    id: item.assignment.id,
                    startTime: item.assignment.startTime,
                    endTime: item.assignment.endTime
                } : null,
                date: item.timestamp ? new Date(item.timestamp).toISOString().split('T')[0] : null,
                time: item.timestamp ? new Date(item.timestamp).toTimeString().split(' ')[0] : null
            }));

            return {
                data: formattedData,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                },
                filters
            };
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            throw error;
        }
    }

    /**
     * Obtener historial específico de usuario
     */
    async getUserHistory(userId, filters = {}) {
        return this.getHistory({
            ...filters,
            userId
        });
    }

    /**
     * Obtener historial específico de guardia
     */
    async getGuardHistory(guardId, filters = {}) {
        return this.getHistory({
            ...filters,
            guardId
        });
    }

    /**
     * Obtener historial específico de bicicleta
     */
    async getBicycleHistory(bicycleId, filters = {}) {
        return this.getHistory({
            ...filters,
            bicycleId
        });
    }

    /**
     * Obtener historial específico de bicicletero
     */
    async getBikerackHistory(bikerackId, filters = {}) {
        return this.getHistory({
            ...filters,
            bikerackId
        });
    }

    /**
     * Obtener estadísticas del historial
     */
    async getHistoryStatistics(startDate, endDate) {
        try {
            const query = this.historyRepository.createQueryBuilder('history')
                .select([
                    'DATE(history.timestamp) as date',
                    'history.historyType as type',
                    'COUNT(*) as count'
                ])
                .where('DATE(history.timestamp) BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate
                })
                .groupBy('DATE(history.timestamp), history.historyType')
                .orderBy('date', 'DESC');

            const dailyStats = await query.getRawMany();

            return {
                period: {
                    startDate,
                    endDate
                },
                summary: {
                    totalEvents: dailyStats.reduce((sum, item) => sum + parseInt(item.count), 0),
                },
                dailyStatistics: dailyStats
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    /**
     * Exportar historial
     */
    async exportHistory(filters = {}) {
        try {
            const result = await this.getHistory({ ...filters, limit: 10000 });
            
            const summary = {
                totalEvents: result.meta.total,
                startDate: filters.startDate,
                endDate: filters.endDate,
                exportedAt: new Date().toISOString(),
                exportedBy: 'Sistema Bicicletero UBB'
            };

            return {
                exportInfo: summary,
                filtersApplied: filters,
                data: result.data
            };
        } catch (error) {
            console.error('Error exportando historial:', error);
            throw error;
        }
    }

    /**
     * Obtener actividad reciente
     */
    async getRecentActivity(limit = 20) {
        try {
            const query = this.historyRepository.createQueryBuilder('history')
                .leftJoinAndSelect('history.user', 'user')
                .leftJoinAndSelect('history.guard', 'guard')
                .leftJoinAndSelect('history.bicycle', 'bicycle')
                .leftJoinAndSelect('history.bikerack', 'bikerack')
                .orderBy('history.timestamp', 'DESC')
                .take(limit);

            const activities = await query.getMany();

            return activities.map(activity => ({
                id: activity.id,
                timestamp: activity.timestamp,
                type: activity.historyType,
                description: activity.description,
                user: activity.user ? `${activity.user.names} ${activity.user.lastName}` : null,
                guard: activity.guard ? `${activity.guard.names} ${activity.guard.lastName}` : null,
                bikerack: activity.bikerack?.name,
                timeAgo: this.getTimeAgo(activity.timestamp)
            }));
        } catch (error) {
            console.error('Error obteniendo actividad reciente:', error);
            throw error;
        }
    }

    // ================================================
    // MÉTODOS AUXILIARES
    // ================================================

    /**
     * Obtener tiempo transcurrido en formato legible
     */
    getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'hace unos segundos';
        if (diffMins < 60) return `hace ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
        if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
        return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    }
}


// Crear instancia
const historyService = new HistoryService();

// Exportar todo
export {
    HISTORY_TYPES,
    historyService
};

// Exportar métodos individualmente para compatibilidad
export const createHistoryRecord = historyService.createHistoryRecord.bind(historyService);
export const logEvent = historyService.logEvent.bind(historyService);
export const logUserCheckIn = historyService.logUserCheckIn.bind(historyService);
export const logUserCheckOut = historyService.logUserCheckOut.bind(historyService);
export const logInfraction = historyService.logInfraction.bind(historyService);
export const getHistory = historyService.getHistory.bind(historyService);
export const getUserHistory = historyService.getUserHistory.bind(historyService);
export const getGuardHistory = historyService.getGuardHistory.bind(historyService);
export const getBicycleHistory = historyService.getBicycleHistory.bind(historyService);
export const getBikerackHistory = historyService.getBikerackHistory.bind(historyService);
export const getHistoryStatistics = historyService.getHistoryStatistics.bind(historyService);
export const exportHistory = historyService.exportHistory.bind(historyService);
export const getRecentActivity = historyService.getRecentActivity.bind(historyService);

// Exportar por defecto la instancia completa
export default historyService;