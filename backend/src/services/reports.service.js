'use strict';

import { AppDataSource } from "../config/configDb.js";
import ReportEntity from "../entities/ReportEntity.js";
import BicicleteroEntity from "../entities/BicicleteroEntity.js";
import HistoryEntity from "../entities/HistoryEntity.js";
import UserEntity from "../entities/UserEntity.js";
import { Between, In } from "typeorm";

class ReportsService {
    constructor() {
        this.reportRepository = AppDataSource.getRepository(ReportEntity);
        this.bikerackRepository = AppDataSource.getRepository(BicicleteroEntity);
        this.historyRepository = AppDataSource.getRepository(HistoryEntity);
        this.userRepository = AppDataSource.getRepository(UserEntity);
    }

    // ==================== GENERAR REPORTE SEMANAL ====================
    async generateWeeklyReport({ weekStart, weekEnd, bikerackId, generatedByUserId }) {
        try {
            console.log('📊 Generando reporte semanal...');

            const startDate = new Date(weekStart);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(weekEnd);
            endDate.setHours(23, 59, 59, 999);

            // Validar fechas
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Fechas inválidas');
            }

            // Obtener movimientos del historial
            const query = this.historyRepository
                .createQueryBuilder('history')
                .leftJoinAndSelect('history.user', 'user')
                .leftJoinAndSelect('history.bicycle', 'bicycle')
                .leftJoinAndSelect('history.bikerack', 'bikerack')
                .where('history.createdAt BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                })
                .andWhere('history.historyType IN (:...types)', {
                    types: ['CHECKIN', 'CHECKOUT']
                });

            if (bikerackId) {
                query.andWhere('history.bikerackId = :bikerackId', { bikerackId });
            }

            const movements = await query
                .orderBy('history.createdAt', 'ASC')
                .getMany();

            console.log(`✅ ${movements.length} movimientos encontrados`);

            // Calcular estadísticas
            const stats = this.calculateWeeklyStats(movements, startDate, endDate);
            
            // Agrupar por día
            const dailyStats = this.groupByDay(movements, startDate, endDate);
            
            // Agrupar por bicicletero
            const bikerackStats = this.groupByBikerack(movements);

            // Obtener datos adicionales de bicicleteros
            const bikeracksData = await this.getBikeracksCapacity(bikerackId);

            // Construir el reporte
            const reportData = {
                title: `Reporte Semanal (${this.formatDateShort(startDate)} al ${this.formatDateShort(endDate)})`,
                reportType: 'uso_semanal',
                period: {
                    start: startDate,
                    end: endDate,
                    formatted: `${this.formatDateShort(startDate)} al ${this.formatDateShort(endDate)}`
                },
                summary: stats,
                dailyStats: dailyStats,
                bikerackStats: bikerackStats,
                bikeracksCapacity: bikeracksData,
                generatedAt: new Date(),
                reportId: `RPT-${Date.now()}`
            };

            // Guardar en base de datos
            const savedReport = await this.saveReport(reportData, generatedByUserId);

            return {
                success: true,
                message: 'Reporte generado exitosamente',
                data: {
                    ...reportData,
                    id: savedReport.id
                }
            };

        } catch (error) {
            console.error('❌ Error generando reporte:', error);
            throw error;
        }
    }

    // ==================== CALCULAR ESTADÍSTICAS ====================
    calculateWeeklyStats(movements, startDate, endDate) {
        const checkins = movements.filter(m => m.historyType === 'CHECKIN').length;
        const checkouts = movements.filter(m => m.historyType === 'CHECKOUT').length;
        
        const uniqueUsers = new Set(movements.map(m => m.user?.id).filter(Boolean));
        const uniqueBicycles = new Set(movements.map(m => m.bicycle?.id).filter(Boolean));
        
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const avgDaily = movements.length > 0 ? Math.round(movements.length / daysDiff) : 0;

        return {
            totalMovements: movements.length,
            totalCheckins: checkins,
            totalCheckouts: checkouts,
            uniqueUsers: uniqueUsers.size,
            uniqueBicycles: uniqueBicycles.size,
            averageDailyUsage: avgDaily,
            daysAnalyzed: daysDiff
        };
    }

    // ==================== AGRUPAR POR DÍA ====================
    groupByDay(movements, startDate, endDate) {
        const days = {};
        const daysArray = [];

        // Crear todos los días del rango
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateKey = this.formatDateShort(currentDate);
            days[dateKey] = {
                date: dateKey,
                dayName: this.getDayName(currentDate),
                checkins: 0,
                checkouts: 0,
                users: new Set(),
                bicycles: new Set()
            };
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Agrupar movimientos
        movements.forEach(movement => {
            const dateKey = this.formatDateShort(movement.createdAt);
            if (days[dateKey]) {
                if (movement.historyType === 'CHECKIN') {
                    days[dateKey].checkins++;
                } else if (movement.historyType === 'CHECKOUT') {
                    days[dateKey].checkouts++;
                }
                if (movement.user?.id) days[dateKey].users.add(movement.user.id);
                if (movement.bicycle?.id) days[dateKey].bicycles.add(movement.bicycle.id);
            }
        });

        // Convertir a array
        return Object.values(days).map(day => ({
            date: day.date,
            dayName: day.dayName,
            checkins: day.checkins,
            checkouts: day.checkouts,
            total: day.checkins + day.checkouts,
            uniqueUsers: day.users.size,
            uniqueBicycles: day.bicycles.size
        }));
    }

    // ==================== AGRUPAR POR BICICLETERO ====================
    groupByBikerack(movements) {
        const bikeracks = {};
        
        movements.forEach(movement => {
            const bikerackName = movement.bikerack?.name || 'Sin Asignar';
            
            if (!bikeracks[bikerackName]) {
                bikeracks[bikerackName] = {
                    name: bikerackName,
                    checkins: 0,
                    checkouts: 0,
                    users: new Set(),
                    bicycles: new Set()
                };
            }
            
            if (movement.historyType === 'CHECKIN') {
                bikeracks[bikerackName].checkins++;
            } else if (movement.historyType === 'CHECKOUT') {
                bikeracks[bikerackName].checkouts++;
            }
            
            if (movement.user?.id) bikeracks[bikerackName].users.add(movement.user.id);
            if (movement.bicycle?.id) bikeracks[bikerackName].bicycles.add(movement.bicycle.id);
        });

        const total = movements.length;
        
        return Object.values(bikeracks).map(b => ({
            name: b.name,
            checkins: b.checkins,
            checkouts: b.checkouts,
            total: b.checkins + b.checkouts,
            uniqueUsers: b.users.size,
            percentage: total > 0 ? Math.round((b.checkins + b.checkouts) / total * 100) : 0
        })).sort((a, b) => b.total - a.total);
    }

    // ==================== OBTENER CAPACIDAD DE BICICLETEROS ====================
    async getBikeracksCapacity(bikerackId = null) {
        const query = this.bikerackRepository.createQueryBuilder('bikerack');
        
        if (bikerackId) {
            query.where('bikerack.id = :bikerackId', { bikerackId });
        }

        const bikeracks = await query.getMany();
        
        return bikeracks.map(b => ({
            id: b.id,
            name: b.name,
            location: b.location || 'No especificada',
            capacity: b.capacity || 0,
            occupied: b.occupied || 0,
            available: (b.capacity || 0) - (b.occupied || 0),
            occupancyRate: b.capacity > 0 ? Math.round((b.occupied / b.capacity) * 100) : 0
        }));
    }

    // ==================== GUARDAR REPORTE ====================
    async saveReport(reportData, userId) {
        const report = this.reportRepository.create({
            reportType: 'uso_semanal',
            title: reportData.title,
            periodStart: reportData.period.start,
            periodEnd: reportData.period.end,
            data: reportData,
            status: 'generated',
            generatedBy: userId
        });

        return await this.reportRepository.save(report);
    }

    // ==================== OBTENER HISTORIAL DE REPORTES ====================
    async getReportsHistory({ page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const [reports, total] = await this.reportRepository
            .createQueryBuilder('report')
            .leftJoinAndSelect('report.generatedByUser', 'user')
            .orderBy('report.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            success: true,
            data: reports.map(r => ({
                id: r.id,
                title: r.title,
                reportType: r.reportType,
                period: {
                    start: r.periodStart,
                    end: r.periodEnd
                },
                status: r.status,
                generatedBy: r.generatedByUser ? {
                    id: r.generatedByUser.id,
                    name: `${r.generatedByUser.names || ''} ${r.generatedByUser.lastName || ''}`.trim()
                } : null,
                createdAt: r.createdAt
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ==================== OBTENER REPORTE POR ID ====================
    async getReportById(reportId) {
        const report = await this.reportRepository
            .createQueryBuilder('report')
            .leftJoinAndSelect('report.generatedByUser', 'user')
            .where('report.id = :id', { id: reportId })
            .getOne();

        if (!report) return null;

        return {
            success: true,
            data: {
                id: report.id,
                title: report.title,
                reportType: report.reportType,
                period: {
                    start: report.periodStart,
                    end: report.periodEnd
                },
                data: report.data,
                status: report.status,
                generatedBy: report.generatedByUser ? {
                    id: report.generatedByUser.id,
                    name: `${report.generatedByUser.names || ''} ${report.generatedByUser.lastName || ''}`.trim()
                } : null,
                createdAt: report.createdAt
            }
        };
    }

    // ==================== UTILIDADES ====================
    formatDateShort(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    getDayName(date) {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[new Date(date).getDay()];
    }
}

export default new ReportsService();