// src/services/reports.service.js
'use strict';

import { getToken } from './auth.service';

const API_URL = '/api';

/**
 * Generar reporte de bicicletero (ingresos y salidas)
 */
export const generateBikerackReport = async ({ startDate, endDate, bikerackId = null }) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No hay token de autenticación');

    const params = new URLSearchParams({
      startDate,
      endDate
    });

    if (bikerackId) {
      params.append('bikerackId', bikerackId);
    }

    const response = await fetch(`${API_URL}/reports/bikerack?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al generar reporte');
    }

    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('❌ Error generating bikerack report:', error);
    return {
      success: false,
      message: error.message || 'Error al generar reporte'
    };
  }
};

/**
 * Generar reporte semanal
 */
export const generateWeeklyReport = async ({ weekStart, weekEnd, bikerackId = null }) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No hay token de autenticación');

    const response = await fetch(`${API_URL}/reports/weekly`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        weekStart,
        weekEnd,
        bikerackId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al generar reporte semanal');
    }

    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('❌ Error generating weekly report:', error);
    return {
      success: false,
      message: error.message || 'Error al generar reporte semanal'
    };
  }
};

/**
 * Obtener historial de reportes
 */
export const getReportsHistory = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No hay token de autenticación');

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_URL}/reports?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener historial de reportes');
    }

    return {
      success: true,
      data: data.data,
      pagination: data.pagination
    };

  } catch (error) {
    console.error('❌ Error fetching reports history:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener historial de reportes',
      data: [],
      pagination: null
    };
  }
};

/**
 * Obtener reporte por ID
 */
export const getReportById = async (reportId) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No hay token de autenticación');

    const response = await fetch(`${API_URL}/reports/${reportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener reporte');
    }

    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('❌ Error fetching report:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener reporte'
    };
  }
};

/**
 * Exportar reporte a PDF (usando window.print)
 */
export const exportReportToPDF = () => {
  try {
    window.print();
    return { success: true };
  } catch (error) {
    console.error('❌ Error exporting to PDF:', error);
    return {
      success: false,
      message: 'Error al exportar a PDF'
    };
  }
};

/**
 * Exportar datos del reporte a CSV
 */
export const exportReportToCSV = (reportData, filename = 'reporte') => {
  try {
    if (!reportData || !reportData.movements || reportData.movements.length === 0) {
      throw new Error('No hay datos para exportar');
    }

    // Crear encabezados CSV
    const headers = [
      'Fecha/Hora',
      'Tipo',
      'Usuario',
      'Bicicleta',
      'Bicicletero'
    ];

    // Convertir datos a filas CSV
    const rows = reportData.movements.map(movement => [
      new Date(movement.createdAt).toLocaleString('es-ES'),
      movement.historyType === 'CHECKIN' ? 'Ingreso' : 'Salida',
      `${movement.user?.names || 'N/A'} ${movement.user?.lastName || ''}`.trim(),
      movement.bicycle?.code || 'N/A',
      movement.bikerack?.name || 'N/A'
    ]);

    // Construir CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };

  } catch (error) {
    console.error('❌ Error exporting to CSV:', error);
    return {
      success: false,
      message: error.message || 'Error al exportar a CSV'
    };
  }
};

/**
 * Obtener rango de fechas predefinido
 */
export const getDateRange = (range) => {
  const today = new Date();
  const start = new Date(today);
  
  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
      
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: start.toISOString().split('T')[0]
      };
      
    case 'week':
      start.setDate(start.getDate() - 7);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
      
    case 'month':
      start.setMonth(start.getMonth() - 1);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
      
    case 'current-week':
      // Lunes de esta semana
      const dayOfWeek = start.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      start.setDate(start.getDate() + diffToMonday);
      
      // Domingo de esta semana
      const sunday = new Date(start);
      sunday.setDate(start.getDate() + 6);
      
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: sunday.toISOString().split('T')[0]
      };
      
    case 'current-month':
      start.setDate(1); // Primer día del mes
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
      
    default:
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
  }
};

/**
 * Validar fechas del reporte
 */
export const validateReportDates = (startDate, endDate) => {
  const errors = [];

  if (!startDate) {
    errors.push('La fecha de inicio es requerida');
  }

  if (!endDate) {
    errors.push('La fecha de fin es requerida');
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (start > end) {
      errors.push('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    if (end > today) {
      errors.push('La fecha de fin no puede ser futura');
    }

    // Límite de 1 año
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 365) {
      errors.push('El rango de fechas no puede ser mayor a 1 año');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formatear período para mostrar
 */
export const formatReportPeriod = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Período no especificado';

  const start = new Date(startDate);
  const end = new Date(endDate);

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const startStr = start.toLocaleDateString('es-ES', options);
  const endStr = end.toLocaleDateString('es-ES', options);

  return `${startStr} al ${endStr}`;
};

// Exportar todas las funciones
export default {
  generateBikerackReport,
  generateWeeklyReport,
  getReportsHistory,
  getReportById,
  exportReportToPDF,
  exportReportToCSV,
  getDateRange,
  validateReportDates,
  formatReportPeriod
};