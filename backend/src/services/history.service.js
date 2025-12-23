'use strict';

import { AppDataSource } from "../config/configDb.js";
import { HistoryEntity } from "../entities/HistoryEntity.js";

// Servicio para obtener estadísticas
export async function getStatisticsService(startDate, endDate) {
    try {
        const historyRepository = AppDataSource.getRepository(HistoryEntity);
        
        const query = historyRepository.createQueryBuilder('history')
            .select([
                'DATE(history.timestamp) as date',  // Usar timestamp en lugar de date
                'history.movementType as type',
                'COUNT(*) as count'
            ])
            .where('DATE(history.timestamp) BETWEEN :startDate AND :endDate', {  // Cambiado aquí
                startDate,
                endDate
            })
            .groupBy('DATE(history.timestamp), history.movementType')  // Cambiado aquí
            .orderBy('date', 'DESC');

        const results = await query.getRawMany();
        
        return {
            period: `${startDate} al ${endDate}`,
            statistics: results,
            summary: {
                total: results.reduce((sum, item) => sum + parseInt(item.count || 0), 0),
                ingresos: results.filter(item => item.type === 'ingreso')
                    .reduce((sum, item) => sum + parseInt(item.count || 0), 0),
                salidas: results.filter(item => item.type === 'salida')
                    .reduce((sum, item) => sum + parseInt(item.count || 0), 0)
            }
        };
    } catch (error) {
        console.error('Error en getStatisticsService:', error);
        throw error;
    }
}

// También actualiza getHistoryService si usa history.date:
export async function getHistoryService(filters) {
    try {
        const historyRepository = AppDataSource.getRepository(HistoryEntity);
        const {
            startDate,
            endDate,
            userId,
            bicycleId,
            bikerackId,
            guardId,
            movementType,
            page = 1,
            limit = 50
        } = filters;

        const skip = (page - 1) * limit;
        
        const query = historyRepository.createQueryBuilder('history')
            .leftJoinAndSelect('history.bicycle', 'bicycle')
            .leftJoinAndSelect('bicycle.user', 'user')
            .leftJoinAndSelect('history.bikerack', 'bikerack')
            .leftJoinAndSelect('history.guard', 'guard')
            .orderBy('history.timestamp', 'DESC');

        // Aplicar filtros - USAR DATE(history.timestamp) en lugar de history.date
        if (startDate && endDate) {
            query.andWhere('DATE(history.timestamp) BETWEEN :startDate AND :endDate', {  // Cambiado
                startDate,
                endDate
            });
        } else if (startDate) {
            query.andWhere('DATE(history.timestamp) >= :startDate', { startDate });  // Cambiado
        } else if (endDate) {
            query.andWhere('DATE(history.timestamp) <= :endDate', { endDate });  // Cambiado
        }

        if (userId) {
            query.andWhere('user.id = :userId', { userId });
        }

        if (bicycleId) {
            query.andWhere('bicycle.id = :bicycleId', { bicycleId });
        }

        if (bikerackId) {
            query.andWhere('bikerack.id = :bikerackId', { bikerackId });
        }

        if (guardId) {
            query.andWhere('guard.id = :guardId', { guardId });
        }

        if (movementType) {
            query.andWhere('history.movementType = :movementType', { movementType });
        }

        // Obtener datos
        const [data, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        // Formatear respuesta
        const formattedData = data.map(item => ({
            id: item.id,
            timestamp: item.timestamp,
            movementType: item.movementType,
            bicycle: {
                id: item.bicycle?.id,
                brand: item.bicycle?.brand,
                model: item.bicycle?.model,
                color: item.bicycle?.color,
                serialNumber: item.bicycle?.serialNumber,
                user: {
                    id: item.bicycle?.user?.id,
                    names: item.bicycle?.user?.names,
                    lastName: item.bicycle?.user?.lastName,
                    email: item.bicycle?.user?.email
                }
            },
            bikerack: {
                id: item.bikerack?.id,
                name: item.bikerack?.name
            },
            guard: {
                id: item.guard?.id,
                names: item.guard?.names,
                lastName: item.guard?.lastName
            },
            guardNotes: item.guardNotes,
            // Agregar date formateada si la necesitas
            date: item.timestamp ? new Date(item.timestamp).toISOString().split('T')[0] : null,
            hour: item.timestamp ? new Date(item.timestamp).toTimeString().split(' ')[0] : null
        }));

        return {
            data: formattedData,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Error en getHistoryService:', error);
        throw error;
    }
}

// Agrega esto al final de history.service.js

// Función para crear registro histórico
export async function createHistoryRecord(data) {
    try {
        const historyRepository = AppDataSource.getRepository(HistoryEntity);
        
        const historyData = {
            movementType: data.movementType || 'ingreso',
            bicycle: data.bicycleId ? { id: data.bicycleId } : null,
            user: data.userId ? { id: data.userId } : null,
            bikerack: data.bikerackId ? { id: data.bikerackId } : null,
            guard: data.guardId ? { id: data.guardId } : null,
            guardNotes: data.notes || null,
            spaceLogId: data.spaceLogId || null
        };

        const history = historyRepository.create(historyData);
        await historyRepository.save(history);
        
        console.log(`Registro histórico creado: ${data.movementType || 'ingreso'}`);
        return history;
    } catch (error) {
        console.error('Error en createHistoryRecord:', error);
        throw error;
    }
}

export async function exportHistoryService(filters) {
    try {
        // Obtener datos sin paginación para exportar
        const data = await getHistoryService({ ...filters, limit: 1000 });
        
        // Calcular resumen
        const ingresos = data.data.filter(item => item.movementType === 'ingreso').length;
        const salidas = data.data.filter(item => item.movementType === 'salida').length;
        
        const summary = {
            total: data.meta.total,
            ingresos,
            salidas,
            period: filters.startDate && filters.endDate 
                ? `${filters.startDate} al ${filters.endDate}`
                : 'Todo el período'
        };

        return {
            data: data.data,
            summary,
            exportInfo: {
                exportedAt: new Date().toISOString(),
                exportedBy: 'Sistema',
                recordCount: data.data.length
            }
        };
    } catch (error) {
        console.error('Error en exportHistoryService:', error);
        throw error;
    }
}