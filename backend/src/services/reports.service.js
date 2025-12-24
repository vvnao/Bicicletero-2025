// services/reports.service.js - VERSIÓN COMPLETA CORREGIDA
'use strict';

import { AppDataSource } from "../config/configDb.js";
import { BikerackEntity } from "../entities/BikerackEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";
import { HistoryEntity } from "../entities/HistoryEntity.js";
import { UserEntity } from "../entities/UserEntity.js";
import { ReportEntity } from "../entities/ReportEntity.js";

class ReportService {
    constructor() {
        this.bikerackRepository = AppDataSource.getRepository(BikerackEntity);
        this.bicycleRepository = AppDataSource.getRepository(BicycleEntity);
        this.historyRepository = AppDataSource.getRepository(HistoryEntity);
        this.userRepository = AppDataSource.getRepository(UserEntity);
        this.reportRepository = AppDataSource.getRepository(ReportEntity);
    }

    // ================================================
    // 1. GENERAR Y GUARDAR REPORTES
    // ================================================

    async generateAndSaveWeeklyReport(params) {
        try {
            const { 
                weekStart, 
                weekEnd, 
                reportType = 'uso_semanal',
                bikerackId, 
                generatedByUserId,
                saveToDatabase = true
            } = params;

            // 1. Generar el reporte
            const reportData = await this.generateWeeklyUsageReport(
                new Date(weekStart), 
                new Date(weekEnd), 
                bikerackId
            );

            let savedReport = null;
            
            // 2. Guardar en base de datos solo si se solicita
            if (saveToDatabase && generatedByUserId) {
                const report = this.reportRepository.create({
                    reportType: 'semanal',
                    reportSubType: reportType,
                    title: `Reporte Semanal - ${reportData.period}`,
                    description: `Reporte de uso del sistema de bicicleteros`,
                    periodStart: weekStart,
                    periodEnd: weekEnd,
                    data: reportData,
                    status: 'generated',
                    generatedBy: generatedByUserId,
                    bikerack: bikerackId ? { id: bikerackId } : null
                });

                savedReport = await this.reportRepository.save(report);
                console.log(`📄 Reporte guardado con ID: ${savedReport.id}`);
            }

            return {
                reportId: savedReport ? savedReport.id : null,
                ...reportData,
                metadata: {
                    savedAt: savedReport ? savedReport.createdAt : null,
                    status: savedReport ? savedReport.status : 'not_saved',
                    reportId: savedReport ? savedReport.id : null,
                    saved: !!savedReport
                }
            };

        } catch (error) {
            console.error('Error generando reporte:', error);
            // Si falla el guardado, igual devolver el reporte generado
            const reportData = await this.generateWeeklyUsageReport(
                new Date(params.weekStart), 
                new Date(params.weekEnd), 
                params.bikerackId
            );
            
            return {
                ...reportData,
                metadata: {
                    saved: false,
                    error: error.message
                }
            };
        }
    }

    // ================================================
    // 2. REPORTE DE USO SEMANAL
    // ================================================

    async generateWeeklyUsageReport(start, end, bikerackId = null) {
        const query = this.historyRepository.createQueryBuilder('history')
            .leftJoinAndSelect('history.bikerack', 'bikerack')
            .leftJoinAndSelect('history.user', 'user')
            .leftJoinAndSelect('history.bicycle', 'bicycle')
            .where('history.timestamp BETWEEN :start AND :end', {
                start: start.toISOString(),
                end: end.toISOString()
            })
            .andWhere('(history.historyType = :checkin OR history.historyType = :checkout)', {
                checkin: 'user_checkin',
                checkout: 'user_checkout'
            });

        if (bikerackId) {
            query.andWhere('history.bikerackId = :bikerackId', { bikerackId });
        }

        const events = await query.orderBy('history.timestamp', 'ASC').getMany();

        // Agrupar por día y por bicicletero
        const stats = {
            daily: {},
            byBikerack: {},
            summary: {
                totalEvents: events.length,
                totalCheckins: 0,
                totalCheckouts: 0,
                uniqueUsers: new Set(),
                uniqueBicycles: new Set(),
                uniqueBikeracks: new Set()
            }
        };

        events.forEach(event => {
            const date = event.timestamp.toISOString().split('T')[0];
            const bikerackName = event.bikerack ? event.bikerack.name : 'Desconocido';
            const type = event.historyType;

            // Estadísticas por día
            if (!stats.daily[date]) {
                stats.daily[date] = {
                    date,
                    checkins: 0,
                    checkouts: 0,
                    users: new Set(),
                    bicycles: new Set(),
                    bikeracks: new Set()
                };
            }

            // Estadísticas por bicicletero
            if (!stats.byBikerack[bikerackName]) {
                stats.byBikerack[bikerackName] = {
                    name: bikerackName,
                    checkins: 0,
                    checkouts: 0,
                    users: new Set(),
                    bicycles: new Set()
                };
            }

            // Actualizar contadores
            if (type === 'user_checkin') {
                stats.daily[date].checkins++;
                stats.byBikerack[bikerackName].checkins++;
                stats.summary.totalCheckins++;
            }
            
            if (type === 'user_checkout') {
                stats.daily[date].checkouts++;
                stats.byBikerack[bikerackName].checkouts++;
                stats.summary.totalCheckouts++;
            }

            // Agregar usuarios únicos
            if (event.user) {
                stats.daily[date].users.add(event.user.id);
                stats.byBikerack[bikerackName].users.add(event.user.id);
                stats.summary.uniqueUsers.add(event.user.id);
            }

            // Agregar bicicletas únicas
            if (event.bicycle) {
                stats.daily[date].bicycles.add(event.bicycle.id);
                stats.byBikerack[bikerackName].bicycles.add(event.bicycle.id);
                stats.summary.uniqueBicycles.add(event.bicycle.id);
            }

            // Agregar bicicleteros únicos
            if (event.bikerack) {
                stats.daily[date].bikeracks.add(event.bikerack.id);
                stats.summary.uniqueBikeracks.add(event.bikerack.id);
            }
        });

        // Convertir Sets a números
        const dailyStats = Object.values(stats.daily).map(day => ({
            ...day,
            total: day.checkins + day.checkouts,
            uniqueUsers: day.users.size,
            uniqueBicycles: day.bicycles.size,
            uniqueBikeracks: day.bikeracks.size
        }));

        const bikerackStats = Object.values(stats.byBikerack).map(b => ({
            ...b,
            total: b.checkins + b.checkouts,
            uniqueUsers: b.users.size,
            uniqueBicycles: b.bicycles.size
        }));

        return {
            title: 'Reporte de Uso Semanal',
            period: `${this.formatDate(start)} a ${this.formatDate(end)}`,
            summary: {
                ...stats.summary,
                totalEvents: stats.summary.totalEvents,
                totalCheckins: stats.summary.totalCheckins,
                totalCheckouts: stats.summary.totalCheckouts,
                uniqueUsers: stats.summary.uniqueUsers.size,
                uniqueBicycles: stats.summary.uniqueBicycles.size,
                uniqueBikeracks: stats.summary.uniqueBikeracks.size,
                daysAnalyzed: dailyStats.length
            },
            dailyStats: dailyStats.sort((a, b) => a.date.localeCompare(b.date)),
            bikerackStats: bikerackStats.sort((a, b) => b.total - a.total),
            capacityIssues: await this.checkCapacityIssues(),
            recommendations: this.generateUsageRecommendations(dailyStats, bikerackStats)
        };
    }

    // ================================================
    // 3. REPORTE DE AUDITORÍA (NUEVO)
    // ================================================

    async generateAuditReport(startDate, endDate, bikerackId = null) {
        try {
            console.log(`🔍 Generando reporte de auditoría: ${startDate} a ${endDate}`);
            
            const auditResults = {
                period: {
                    start: startDate,
                    end: endDate
                },
                summary: {
                    status: 'OK',
                    issuesFound: 0,
                    warnings: 0
                },
                checks: [],
                issues: [],
                recommendations: []
            };

            // Check 1: Consistencia de inventario
            const inventoryCheck = await this.checkInventoryConsistency(bikerackId);
            auditResults.checks.push(inventoryCheck);
            
            if (inventoryCheck.issues.length > 0) {
                auditResults.summary.issuesFound += inventoryCheck.issues.length;
                auditResults.issues.push(...inventoryCheck.issues);
            }

            // Check 2: Check-ins sin check-outs
            const checkinCheck = await this.checkUnmatchedCheckins(startDate, endDate, bikerackId);
            auditResults.checks.push(checkinCheck);
            
            if (checkinCheck.issues.length > 0) {
                auditResults.summary.issuesFound += checkinCheck.issues.length;
                auditResults.issues.push(...checkinCheck.issues);
            }

            // Check 3: Sobrecapacidad
            const capacityCheck = await this.checkCapacityIssues(bikerackId);
            auditResults.checks.push(capacityCheck);
            
            const overCapacityIssues = capacityCheck.issues.filter(i => i.severity === 'ALTA');
            if (overCapacityIssues.length > 0) {
                auditResults.summary.issuesFound += overCapacityIssues.length;
                auditResults.issues.push(...overCapacityIssues.map(issue => ({
                    type: 'SOBRECAPACIDAD',
                    severity: 'ALTA',
                    description: `${issue.bikerackName}: ${issue.details}`,
                    bikerackId: issue.bikerackId,
                    suggestedAction: issue.suggestedAction || 'Redistribuir bicicletas'
                })));
            }

            // Check 4: Bicicletas inactivas
            const inactiveCheck = await this.checkInactiveBicycles(startDate, endDate, bikerackId);
            auditResults.checks.push(inactiveCheck);
            
            if (inactiveCheck.warnings.length > 0) {
                auditResults.summary.warnings += inactiveCheck.warnings.length;
                auditResults.recommendations.push(...inactiveCheck.warnings);
            }

            // Check 5: Tiempos excedidos
            const overtimeCheck = await this.checkOvertimeUsers(startDate, endDate, bikerackId);
            auditResults.checks.push(overtimeCheck);
            
            if (overtimeCheck.issues.length > 0) {
                auditResults.summary.issuesFound += overtimeCheck.issues.length;
                auditResults.issues.push(...overtimeCheck.issues);
            }

            // Actualizar estado general
            if (auditResults.summary.issuesFound > 0) {
                auditResults.summary.status = 'PROBLEMAS';
            } else if (auditResults.summary.warnings > 0) {
                auditResults.summary.status = 'ADVERTENCIAS';
            }

            // Generar recomendaciones
            this.generateAuditRecommendations(auditResults);

            return auditResults;
        } catch (error) {
            console.error('Error generando reporte de auditoría:', error);
            throw error;
        }
    }

    async checkInventoryConsistency(bikerackId = null) {
        const check = {
            name: 'Consistencia de Inventario',
            description: 'Verifica que los registros coincidan con la realidad',
            status: 'OK',
            issues: [],
            details: {}
        };

        try {
            // Obtener bicicleteros
            let bikeracks;
            if (bikerackId) {
                bikeracks = [await this.bikerackRepository.findOne({ 
                    where: { id: bikerackId }
                })];
            } else {
                bikeracks = await this.bikerackRepository.find();
            }

            for (const bikerack of bikeracks) {
                if (!bikerack) continue;

                // Contar bicicletas registradas
                const registeredBicycles = await this.bicycleRepository.count({
                    where: { bikerack: { id: bikerack.id } }
                });

                // Contar check-ins activos
                const physicallyOccupied = await this.historyRepository
                    .createQueryBuilder('history')
                    .where('history.bikerackId = :bikerackId', { bikerackId: bikerack.id })
                    .andWhere('history.historyType = :checkin', { checkin: 'user_checkin' })
                    .andWhere('NOT EXISTS (' +
                        'SELECT 1 FROM history h2 ' +
                        'WHERE h2.bicycleId = history.bicycleId ' +
                        'AND h2.historyType = :checkout ' +
                        'AND h2.timestamp > history.timestamp' +
                        ')', { checkout: 'user_checkout' })
                    .getCount();

                check.details[`bikerack_${bikerack.id}`] = {
                    name: bikerack.name,
                    registered: registeredBicycles,
                    physicallyOccupied: physicallyOccupied,
                    difference: registeredBicycles - physicallyOccupied
                };

                if (Math.abs(registeredBicycles - physicallyOccupied) > 2) {
                    check.status = 'PROBLEMA';
                    check.issues.push({
                        type: 'INCONSISTENCIA_INVENTARIO',
                        severity: 'MEDIA',
                        description: `${bikerack.name}: Registros vs físicas difieren`,
                        bikerackId: bikerack.id,
                        suggestedAction: 'Realizar conteo físico'
                    });
                }
            }
        } catch (error) {
            console.error('Error en checkInventoryConsistency:', error);
            check.status = 'ERROR';
        }

        return check;
    }

    async checkUnmatchedCheckins(startDate, endDate, bikerackId = null) {
        const check = {
            name: 'Check-ins Pendientes',
            description: 'Verifica check-ins sin check-out',
            status: 'OK',
            issues: [],
            details: {}
        };

        try {
            const query = this.historyRepository
                .createQueryBuilder('checkin')
                .leftJoinAndSelect('checkin.user', 'user')
                .leftJoinAndSelect('checkin.bicycle', 'bicycle')
                .leftJoinAndSelect('checkin.bikerack', 'bikerack')
                .where('checkin.historyType = :checkinType', { checkinType: 'user_checkin' })
                .andWhere('checkin.timestamp BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                })
                .andWhere('NOT EXISTS (' +
                    'SELECT 1 FROM history checkout ' +
                    'WHERE checkout.bicycleId = checkin.bicycleId ' +
                    'AND checkout.historyType = :checkoutType ' +
                    'AND checkout.timestamp > checkin.timestamp' +
                    ')', { checkoutType: 'user_checkout' });

            if (bikerackId) {
                query.andWhere('checkin.bikerackId = :bikerackId', { bikerackId });
            }

            const unmatchedCheckins = await query.getMany();
            check.details.total = unmatchedCheckins.length;

            if (unmatchedCheckins.length > 0) {
                check.status = 'PROBLEMA';
                unmatchedCheckins.forEach(item => {
                    check.issues.push({
                        type: 'CHECKIN_SIN_CHECKOUT',
                        severity: 'ALTA',
                        description: `${item.user?.names || 'Usuario'} sin check-out`,
                        userId: item.user?.id,
                        bicycleId: item.bicycle?.id,
                        suggestedAction: 'Registrar check-out manual'
                    });
                });
            }
        } catch (error) {
            console.error('Error en checkUnmatchedCheckins:', error);
            check.status = 'ERROR';
        }

        return check;
    }

    async checkInactiveBicycles(startDate, endDate, bikerackId = null) {
        const check = {
            name: 'Bicicletas Inactivas',
            description: 'Bicicletas sin movimiento reciente',
            status: 'OK',
            warnings: [],
            details: {}
        };

        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const query = this.bicycleRepository
                .createQueryBuilder('bicycle')
                .leftJoinAndSelect('bicycle.bikerack', 'bikerack')
                .where('NOT EXISTS (' +
                    'SELECT 1 FROM history h ' +
                    'WHERE h.bicycleId = bicycle.id ' +
                    'AND h.timestamp > :sevenDaysAgo' +
                    ')', { sevenDaysAgo: sevenDaysAgo.toISOString() })
                .andWhere('bicycle.status = :active', { active: 'active' });

            if (bikerackId) {
                query.andWhere('bicycle.bikerackId = :bikerackId', { bikerackId });
            }

            const inactiveBicycles = await query.getMany();
            check.details.total = inactiveBicycles.length;

            if (inactiveBicycles.length > 0) {
                check.status = 'ADVERTENCIA';
                inactiveBicycles.forEach(bicycle => {
                    check.warnings.push({
                        type: 'BICICLETA_INACTIVA',
                        severity: 'BAJA',
                        description: `Bicicleta ${bicycle.brand} inactiva por 7+ días`,
                        bicycleId: bicycle.id,
                        suggestedAction: 'Verificar estado'
                    });
                });
            }
        } catch (error) {
            console.error('Error en checkInactiveBicycles:', error);
            check.status = 'ERROR';
        }

        return check;
    }

    async checkOvertimeUsers(startDate, endDate, bikerackId = null) {
        const check = {
            name: 'Tiempos Excedidos',
            description: 'Usuarios que excedieron tiempo',
            status: 'OK',
            issues: [],
            details: {}
        };

        try {
            const query = this.historyRepository
                .createQueryBuilder('infraction')
                .leftJoinAndSelect('infraction.user', 'user')
                .leftJoinAndSelect('infraction.bicycle', 'bicycle')
                .leftJoinAndSelect('infraction.bikerack', 'bikerack')
                .where('infraction.historyType = :infractionType', { infractionType: 'infraction' })
                .andWhere('infraction.timestamp BETWEEN :start AND :end', {
                    start: startDate,
                    end: endDate
                });

            if (bikerackId) {
                query.andWhere('infraction.bikerackId = :bikerackId', { bikerackId });
            }

            const infractions = await query.getMany();
            check.details.total = infractions.length;

            if (infractions.length > 0) {
                check.status = 'PROBLEMA';
                infractions.forEach(infraction => {
                    check.issues.push({
                        type: 'TIEMPO_EXCEDIDO',
                        severity: 'MEDIA',
                        description: `${infraction.user?.names || 'Usuario'} excedió tiempo`,
                        userId: infraction.user?.id,
                        suggestedAction: 'Notificar al usuario'
                    });
                });
            }
        } catch (error) {
            console.error('Error en checkOvertimeUsers:', error);
            check.status = 'ERROR';
        }

        return check;
    }

    generateAuditRecommendations(auditResults) {
        const { issues } = auditResults;

        // Recomendaciones basadas en problemas encontrados
        if (issues.some(i => i.type === 'SOBRECAPACIDAD')) {
            auditResults.recommendations.push({
                priority: 'ALTA',
                action: 'Redistribuir bicicletas',
                details: 'Hay bicicleteros sobrecargados'
            });
        }

        if (issues.some(i => i.type === 'CHECKIN_SIN_CHECKOUT')) {
            auditResults.recommendations.push({
                priority: 'ALTA',
                action: 'Resolver check-ins pendientes',
                details: 'Hay bicicletas sin check-out registrado'
            });
        }

        if (issues.some(i => i.type === 'INCONSISTENCIA_INVENTARIO')) {
            auditResults.recommendations.push({
                priority: 'MEDIA',
                action: 'Auditoría física de inventario',
                details: 'Diferencias en registros vs realidad'
            });
        }

        // Si todo está bien
        if (auditResults.summary.issuesFound === 0) {
            auditResults.recommendations.push({
                priority: 'BAJA',
                action: 'Continuar operación normal',
                details: 'Sistema funcionando correctamente'
            });
        }
    }

    // ================================================
    // 4. DETECCIÓN DE SOBRECAPACIDAD
    // ================================================

    async checkCapacityIssues(bikerackId = null) {
        let bikeracks;
        
        if (bikerackId) {
            bikeracks = [await this.bikerackRepository.findOne({ 
                where: { id: bikerackId } 
            })];
        } else {
            bikeracks = await this.bikerackRepository.find();
        }

        const capacityReport = [];
        const issues = [];

        for (const bikerack of bikeracks) {
            if (!bikerack) continue;

            // Contar bicicletas asignadas a este bicicletero
            const bicycleCount = await this.bicycleRepository.count({
                where: { bikerack: { id: bikerack.id } }
            });

            const utilization = bikerack.capacity > 0 ? 
                Math.round((bicycleCount / bikerack.capacity) * 100) : 0;

            let status, severity;
            
            if (bicycleCount > bikerack.capacity) {
                status = 'SOBRECAPACIDAD';
                severity = 'ALTA';
                
                issues.push({
                    bikerackId: bikerack.id,
                    bikerackName: bikerack.name,
                    problem: 'Sobrepaso de capacidad',
                    details: `${bicycleCount} / ${bikerack.capacity} bicicletas`,
                    excess: bicycleCount - bikerack.capacity,
                    severity
                });
            } 
            else if (bicycleCount === bikerack.capacity) {
                status = 'LLENO';
                severity = 'MEDIA';
            }
            else if (utilization < 30) {
                status = 'BAJA OCUPACIÓN';
                severity = 'BAJA';
            }
            else {
                status = 'OK';
                severity = 'NORMAL';
            }

            capacityReport.push({
                id: bikerack.id,
                name: bikerack.name,
                capacity: bikerack.capacity,
                currentBicycles: bicycleCount,
                availableSpaces: bikerack.capacity - bicycleCount,
                utilization: `${utilization}%`,
                status,
                severity
            });
        }

        return {
            timestamp: new Date().toISOString(),
            totalBikeracks: capacityReport.length,
            issuesCount: issues.length,
            bikeracks: capacityReport.sort((a, b) => {
                // Ordenar por severidad: ALTA > MEDIA > BAJA > NORMAL
                const severityOrder = { ALTA: 0, MEDIA: 1, BAJA: 2, NORMAL: 3 };
                return severityOrder[a.severity] - severityOrder[b.severity];
            }),
            issues: issues
        };
    }

    // ================================================
    // 5. PLAN DE REDISTRIBUCIÓN
    // ================================================

    async generateRedistributionPlan(overCapacityBikerackId, generatedByUserId) {
        try {
            // 1. Verificar sobrecapacidad
            const capacityCheck = await this.checkCapacityIssues(overCapacityBikerackId);
            
            if (capacityCheck.issuesCount === 0) {
                throw new Error('El bicicletero no tiene problemas de capacidad');
            }

            const sourceBikerack = capacityCheck.bikeracks[0];
            const excess = sourceBikerack.currentBicycles - sourceBikerack.capacity;

            // 2. Buscar bicicleteros destino con espacio
            const allBikeracks = await this.bikerackRepository.find();
            const targets = [];

            for (const bikerack of allBikeracks) {
                if (bikerack.id === overCapacityBikerackId) continue;

                const bicycleCount = await this.bicycleRepository.count({
                    where: { bikerack: { id: bikerack.id } }
                });

                const available = bikerack.capacity - bicycleCount;

                if (available > 0) {
                    targets.push({
                        bikerack,
                        currentBicycles: bicycleCount,
                        availableSpaces: available,
                        utilization: bikerack.capacity > 0 ? 
                            Math.round((bicycleCount / bikerack.capacity) * 100) : 0
                    });
                }
            }

            // 3. Ordenar por espacio disponible (más espacio primero)
            targets.sort((a, b) => b.availableSpaces - a.availableSpaces);

            // 4. Generar plan
            const plan = [];
            let remainingExcess = excess;

            for (const target of targets) {
                if (remainingExcess <= 0) break;

                const toMove = Math.min(target.availableSpaces, Math.ceil(remainingExcess / targets.length));

                if (toMove > 0) {
                    plan.push({
                        fromBikerack: {
                            id: sourceBikerack.id,
                            name: sourceBikerack.name
                        },
                        toBikerack: {
                            id: target.bikerack.id,
                            name: target.bikerack.name
                        },
                        bicyclesToMove: toMove,
                        reason: `Espacio disponible: ${target.availableSpaces} lugares`,
                        before: {
                            source: sourceBikerack.currentBicycles,
                            target: target.currentBicycles
                        },
                        after: {
                            source: sourceBikerack.currentBicycles - toMove,
                            target: target.currentBicycles + toMove
                        }
                    });

                    remainingExcess -= toMove;
                }
            }

            // 5. Crear reporte de redistribución
            const reportData = {
                planId: `REDIST-${Date.now()}-${overCapacityBikerackId}`,
                generatedAt: new Date().toISOString(),
                problem: {
                    bikerackId: sourceBikerack.id,
                    bikerackName: sourceBikerack.name,
                    excess: excess,
                    details: `Capacidad: ${sourceBikerack.capacity}, Actual: ${sourceBikerack.currentBicycles}`
                },
                availableTargets: targets.length,
                redistributionPlan: plan,
                summary: {
                    totalToMove: excess - remainingExcess,
                    remainingExcess: remainingExcess,
                    canExecuteFully: remainingExcess === 0,
                    executionStatus: remainingExcess === 0 ? 'COMPLETABLE' : 'PARCIAL'
                },
                targets: targets.map(t => ({
                    id: t.bikerack.id,
                    name: t.bikerack.name,
                    availableSpaces: t.availableSpaces,
                    utilization: `${t.utilization}%`
                }))
            };

            // 6. Guardar el plan como reporte
            const report = this.reportRepository.create({
                reportType: 'redistribucion',
                reportSubType: 'automatica',
                title: `Plan de Redistribución - ${sourceBikerack.name}`,
                description: `Redistribución automática por sobrecapacidad`,
                periodStart: new Date().toISOString().split('T')[0],
                periodEnd: new Date().toISOString().split('T')[0],
                data: reportData,
                status: 'generated',
                generatedBy: generatedByUserId,
                bikerack: { id: overCapacityBikerackId }
            });

            const savedReport = await this.reportRepository.save(report);

            return {
                ...reportData,
                reportId: savedReport.id,
                saved: true
            };

        } catch (error) {
            console.error('Error generando plan de redistribución:', error);
            throw error;
        }
    }

    // ================================================
    // 6. HISTORIAL DE REPORTES
    // ================================================

    async getReportHistory(filters = {}) {
        const { 
            page = 1, 
            limit = 20, 
            reportType, 
            startDate, 
            endDate, 
            bikerackId,
            status 
        } = filters;

        const skip = (page - 1) * limit;

        const query = this.reportRepository.createQueryBuilder('report')
            .leftJoinAndSelect('report.generatedByUser', 'generatedByUser')
            .leftJoinAndSelect('report.reviewedByUser', 'reviewedByUser')
            .leftJoinAndSelect('report.executedByUser', 'executedByUser')
            .leftJoinAndSelect('report.bikerack', 'bikerack')
            .orderBy('report.createdAt', 'DESC');

        // Aplicar filtros
        if (reportType) {
            query.andWhere('report.reportType = :reportType', { reportType });
        }

        if (status) {
            query.andWhere('report.status = :status', { status });
        }

        if (startDate && endDate) {
            query.andWhere('report.periodStart BETWEEN :startDate AND :endDate', {
                startDate,
                endDate
            });
        }

        if (bikerackId) {
            query.andWhere('report.bikerack_id = :bikerackId', { bikerackId });
        }

        const [reports, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            reports: reports.map(report => ({
                id: report.id,
                reportType: report.reportType,
                reportSubType: report.reportSubType,
                title: report.title,
                period: {
                    start: report.periodStart,
                    end: report.periodEnd
                },
                status: report.status,
                generatedBy: report.generatedByUser ? {
                    id: report.generatedByUser.id,
                    name: report.generatedByUser.name
                } : null,
                reviewedBy: report.reviewedByUser ? {
                    id: report.reviewedByUser.id,
                    name: report.reviewedByUser.name
                } : null,
                executedBy: report.executedByUser ? {
                    id: report.executedByUser.id,
                    name: report.executedByUser.name
                } : null,
                bikerack: report.bikerack ? {
                    id: report.bikerack.id,
                    name: report.bikerack.name
                } : null,
                createdAt: report.createdAt,
                updatedAt: report.updatedAt
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // ================================================
    // 7. FUNCIONES AUXILIARES
    // ================================================

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    generateUsageRecommendations(dailyStats, bikerackStats) {
        const recommendations = [];

        if (dailyStats.length === 0) {
            return ['No hay datos de uso en el período analizado'];
        }

        // Analizar días con más actividad
        const maxDay = dailyStats.reduce((max, day) => 
            day.total > max.total ? day : max, dailyStats[0]);
        
        const minDay = dailyStats.reduce((min, day) => 
            day.total < min.total ? day : min, dailyStats[0]);

        if (maxDay.total > minDay.total * 3) {
            recommendations.push(`Días de alta demanda: ${maxDay.date} (${maxDay.total} movimientos)`);
        }

        // Analizar distribución por bicicletero
        const totalMovements = bikerackStats.reduce((sum, b) => sum + b.total, 0);
        
        if (totalMovements > 0) {
            const topBikerack = bikerackStats[0];
            const topPercentage = Math.round((topBikerack.total / totalMovements) * 100);
            
            if (topPercentage > 50) {
                recommendations.push(`El bicicletero "${topBikerack.name}" concentra el ${topPercentage}% de la actividad`);
            }
        }

        return recommendations.length > 0 ? recommendations : ['Patrón de uso estable y distribuido'];
    }
}

// Crear instancia
const reportService = new ReportService();

// Exportar todo
export {
    reportService
};

// Exportar métodos individualmente
export const generateAndSaveWeeklyReport = reportService.generateAndSaveWeeklyReport.bind(reportService);
export const generateWeeklyUsageReport = reportService.generateWeeklyUsageReport.bind(reportService);
export const checkCapacityIssues = reportService.checkCapacityIssues.bind(reportService);
export const generateRedistributionPlan = reportService.generateRedistributionPlan.bind(reportService);
export const getReportHistory = reportService.getReportHistory.bind(reportService);
export const generateAuditReport = reportService.generateAuditReport.bind(reportService);

// Exportar por defecto
export default reportService;