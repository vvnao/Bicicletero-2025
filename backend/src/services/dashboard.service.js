import { AppDataSource } from '../config/configDb.js';
import { IncidenceEntity } from '../entities/IncidenceEntity.js';
import ReportEntity from '../entities/ReportEntity.js'; 
// Asume que tienes entidades para Movimientos, Bikeracks y Usuarios
export async function getIncidentStatus() {
    const total = await incidenceRepository.count();
    const pendientes = await incidenceRepository.count({ where: { status: 'pending' } });
    return { total, pendientes };
}

    // Dentro de dashboard.service.js
export const getZoneStats = async () => {
    // Aquí podrías hacer un conteo real por cada zona en tu DB
    return {
        norte: { id: 1, ocupado: 12, total: 20 },
        sur: { id: 2, ocupado: 5, total: 15 },
        este: { id: 3, ocupado: 18, total: 20 },
        oeste: { id: 4, ocupado: 4, total: 10 }
    };
};
export const DashboardService = {
    /**
     * Obtiene todas las métricas para las tarjetas y el gráfico de barras
     */
    async getMetrics() {
        try {
            const incidenceRepo = AppDataSource.getRepository(IncidenceEntity);
            
            // 1. Inconsistencias (Imagen 2: Tarjeta izquierda)
            // Contamos incidencias que no han sido resueltas
            const inconsistencies = await incidenceRepo.count({
                where: { status: 'pending' }
            });

            // 2. Resumen de hoy (Simulado por ahora, requiere tabla Movimientos)
            const summaryToday = {
                ingresos: 50,  // Select count de ingresos hoy
                salidas: 45,   // Select count de salidas hoy
                activos: 100   // Bicicletas que no han marcado entrada aún
            };

            // 3. Capacidad de Bicicleteros (Imagen 2: Gráfico de barras)
            const capacityData = [
                { name: 'A', ocupado: 8, total: 20 },
                { name: 'B', ocupado: 12, total: 20 },
                { name: 'C', ocupado: 15, total: 20 },
                { name: 'D', ocupado: 20, total: 20 }
            ];

            return {
                inconsistencies,
                summaryToday,
                capacityData
            };
        } catch (error) {
            console.error("Error al calcular métricas de Dashboard:", error);
            throw error;
        }
    },

    /**
     * Obtiene la asignación de guardias por bicicletero (Imagen 1)
     */
    async getGuardAssignments() {
        // Aquí harías un QueryBuilder para unir Usuarios con sus zonas asignadas
        return [
            { rack: 'A', guards: ['Juan Gabriel', 'María Magdalena'] },
            { rack: 'B', guards: ['Pedro Sánchez'] },
            { rack: 'C', guards: ['Aurora', 'Luis Miguel'] },
            { rack: 'D', guards: ['Rosalía', 'Jimin'] }
        ];
    }
};