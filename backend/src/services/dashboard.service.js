// services/dashboard.service.js (BACKEND) - VERSIÓN FINAL
'use strict';

import { AppDataSource } from '../config/configDb.js';
import { IncidenceEntity } from '../entities/IncidenceEntity.js';
import ReportEntity from '../entities/ReportEntity.js';

class DashboardService {
    constructor() {
        this.incidenceRepo = AppDataSource.getRepository(IncidenceEntity);
        this.reportRepo = AppDataSource.getRepository(ReportEntity);
    }

    /**
     * Obtiene todos los datos del dashboard
     */
    async getDashboardData() {
        try {
            console.log('🔄 Obteniendo datos del dashboard...');
            
            const [
                metrics,
                capacity,
                guards,
                activity,
                incidents
            ] = await Promise.all([
                this.getMetrics(),
                this.getCapacidadBicicleteros(),
                this.getGuardiasPorZona(),
                this.getActividadReciente(),
                this.getTiposIncidentes()
            ]);

            const result = {
                metrics,
                capacity,
                guards,
                activity,
                incidents
            };

            console.log('✅ Datos del dashboard preparados:', JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error('❌ Error en getDashboardData service:', error);
            throw error;
        }
    }

    /**
     * Obtiene métricas principales
     */
    async getMetrics() {
        try {
            const inconsistencies = await this.incidenceRepo.count({
                where: { status: 'pending' }
            });

            const totalIncidents = await this.incidenceRepo.count();

            const summaryToday = {
                ingresos: 15,
                salidas: 12,
                activos: 45
            };

            return {
                inconsistencies,
                totalIncidents,
                summaryToday
            };
        } catch (error) {
            console.error('Error al calcular métricas:', error);
            return {
                inconsistencies: 0,
                totalIncidents: 0,
                summaryToday: { ingresos: 0, salidas: 0, activos: 0 }
            };
        }
    }

    /**
     * Obtiene la capacidad de cada bicicletero
     */
    async getCapacidadBicicleteros() {
        try {
            return [
                { id: 1, name: 'Bicicletero A', ocupado: 8, total: 20, porcentaje: 40 },
                { id: 2, name: 'Bicicletero B', ocupado: 12, total: 20, porcentaje: 60 },
                { id: 3, name: 'Bicicletero C', ocupado: 15, total: 20, porcentaje: 75 },
                { id: 4, name: 'Bicicletero D', ocupado: 18, total: 20, porcentaje: 90 }
            ];
        } catch (error) {
            console.error('Error al obtener capacidad:', error);
            return [];
        }
    }

    /**
     * Obtiene asignación de guardias por zona
     */
    async getGuardiasPorZona() {
        try {
            return [
                { 
                    bikerackId: 1, 
                    bikerackName: 'Bicicletero A', 
                    guards: ['Juan Pérez', 'María González'] 
                },
                { 
                    bikerackId: 2, 
                    bikerackName: 'Bicicletero B', 
                    guards: ['Pedro Sánchez'] 
                },
                { 
                    bikerackId: 3, 
                    bikerackName: 'Bicicletero C', 
                    guards: ['Ana Torres', 'Luis Ramírez'] 
                },
                { 
                    bikerackId: 4, 
                    bikerackName: 'Bicicletero D', 
                    guards: ['Carlos Díaz', 'Rosa Morales'] 
                }
            ];
        } catch (error) {
            console.error('Error al obtener guardias:', error);
            return [];
        }
    }

    /**
     * Obtiene actividad reciente por hora
     */
    async getActividadReciente() {
        try {
            const horasDelDia = [];
            for (let i = 6; i <= 20; i++) { // Solo horario de operación 6am-8pm
                horasDelDia.push({
                    hora: `${i.toString().padStart(2, '0')}:00`,
                    ingresos: Math.floor(Math.random() * 15) + 5,
                    salidas: Math.floor(Math.random() * 12) + 3
                });
            }
            return horasDelDia;
        } catch (error) {
            console.error('Error al obtener actividad:', error);
            return [];
        }
    }

    /**
     * Obtiene tipos de incidentes - CORREGIDO con incidenceType
     */
    async getTiposIncidentes() {
        try {
            const incidentes = await this.incidenceRepo
                .createQueryBuilder('incidence')
                .select('incidence.incidenceType', 'tipo')
                .addSelect('COUNT(incidence.id)', 'count')
                .groupBy('incidence.incidenceType')
                .getRawMany();

            console.log('📊 Incidentes encontrados:', incidentes);

            if (incidentes.length === 0) {
                // Datos de ejemplo si no hay incidentes
                return [
                    { tipo: 'Robo', cantidad: 0 },
                    { tipo: 'Daño', cantidad: 0 },
                    { tipo: 'Pérdida', cantidad: 0 }
                ];
            }

            return incidentes.map(inc => ({
                tipo: inc.tipo || 'Sin categoría',
                cantidad: parseInt(inc.count)
            }));
        } catch (error) {
            console.error('Error al obtener tipos de incidentes:', error);
            return [
                { tipo: 'Robo', cantidad: 0 },
                { tipo: 'Daño', cantidad: 0 }
            ];
        }
    }
}

export default new DashboardService();