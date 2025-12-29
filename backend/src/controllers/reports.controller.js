'use strict';

import historyService from '../services/history.service.js';
import { handleSuccess, handleErrorServer } from '../Handlers/responseHandlers.js';

// ==================== GENERAR REPORTE DE INGRESOS Y SALIDAS ====================
export const generateBikerackReport = async (req, res) => {
    try {
        const { startDate, endDate, bikerackId } = req.query;
        const userId = req.user?.id;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Las fechas de inicio y fin son requeridas'
            });
        }

        // Usar el servicio de historial que ya tienes
        const filters = {
            startDate,
            endDate,
            bikerackId: bikerackId ? parseInt(bikerackId) : undefined,
            historyType: 'CHECKIN,CHECKOUT', // Solo entradas y salidas
            page: 1,
            limit: 1000 // Obtener todos los registros
        };

        const historyResult = await historyService.getHistory(filters);

        // Procesar datos para el reporte
        const report = {
            title: `Reporte de Ingresos y Salidas`,
            period: {
                start: startDate,
                end: endDate,
                formatted: `${formatDate(startDate)} al ${formatDate(endDate)}`
            },
            summary: calculateSummary(historyResult.data || []),
            dailyStats: groupByDay(historyResult.data || []),
            bikerackStats: groupByBikerack(historyResult.data || []),
            movements: historyResult.data || [],
            generatedAt: new Date(),
            generatedBy: userId
        };

        return handleSuccess(res, 200, 'Reporte generado exitosamente', report);

    } catch (error) {
        console.error('❌ Error generando reporte:', error);
        return handleErrorServer(res, 500, 'Error generando reporte', error.message);
    }
};

// ==================== FUNCIONES AUXILIARES ====================

function calculateSummary(movements) {
    const checkins = movements.filter(m => m.historyType === 'CHECKIN').length;
    const checkouts = movements.filter(m => m.historyType === 'CHECKOUT').length;
    
    const uniqueUsers = new Set(movements.map(m => m.user?.id).filter(Boolean)).size;
    const uniqueBicycles = new Set(movements.map(m => m.bicycle?.id).filter(Boolean)).size;

    return {
        totalMovements: movements.length,
        totalCheckins: checkins,
        totalCheckouts: checkouts,
        uniqueUsers,
        uniqueBicycles
    };
}

function groupByDay(movements) {
    const days = {};
    
    movements.forEach(movement => {
        const date = formatDate(movement.createdAt);
        
        if (!days[date]) {
            days[date] = {
                date,
                checkins: 0,
                checkouts: 0,
                users: new Set(),
                bicycles: new Set()
            };
        }
        
        if (movement.historyType === 'CHECKIN') {
            days[date].checkins++;
        } else if (movement.historyType === 'CHECKOUT') {
            days[date].checkouts++;
        }
        
        if (movement.user?.id) days[date].users.add(movement.user.id);
        if (movement.bicycle?.id) days[date].bicycles.add(movement.bicycle.id);
    });

    return Object.values(days).map(day => ({
        date: day.date,
        checkins: day.checkins,
        checkouts: day.checkouts,
        total: day.checkins + day.checkouts,
        uniqueUsers: day.users.size,
        uniqueBicycles: day.bicycles.size
    }));
}

function groupByBikerack(movements) {
    const bikeracks = {};
    
    movements.forEach(movement => {
        const name = movement.bikerack?.name || 'Sin Asignar';
        
        if (!bikeracks[name]) {
            bikeracks[name] = {
                name,
                checkins: 0,
                checkouts: 0,
                users: new Set(),
                bicycles: new Set()
            };
        }
        
        if (movement.historyType === 'CHECKIN') {
            bikeracks[name].checkins++;
        } else if (movement.historyType === 'CHECKOUT') {
            bikeracks[name].checkouts++;
        }
        
        if (movement.user?.id) bikeracks[name].users.add(movement.user.id);
        if (movement.bicycle?.id) bikeracks[name].bicycles.add(movement.bicycle.id);
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

function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}