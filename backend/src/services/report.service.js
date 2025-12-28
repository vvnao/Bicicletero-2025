import { AppDataSource } from '../config/configDb.js';
import ReportHistoryEntity from '../entities/ReportHistoryEntity.js';
// Importa aquí tus otras entidades si necesitas consultar datos para el reporte
import IncidenceEntity from '../entities/IncidenceEntity.js';

const historyRepository = AppDataSource.getRepository(ReportHistoryEntity);
const incidenceRepository = AppDataSource.getRepository(IncidenceEntity);

/**
 * Registra la generación de un reporte en la base de datos
 */
export async function saveReportToHistory(reportData, admin) {
  try {
    const newEntry = historyRepository.create({
      reportType: reportData.type,     // Ej: "Uso de Bicicletas"
      dateRange: reportData.range,     // Ej: "21/12/2025 - 28/12/2025"
      format: reportData.format,       // Ej: "Excel"
      generatedBy: admin,              // Objeto del administrador logueado
    });

    return await historyRepository.save(newEntry);
  } catch (error) {
    console.error('Error al guardar en el historial:', error.message);
    throw error;
  }
}

/**
 * Obtiene los últimos reportes generados (para la tabla inferior de tu UI)
 */
export async function getRecentReports() {
  try {
    return await historyRepository.find({
      relations: ['generatedBy'],
      order: { createdAt: 'DESC' },
      take: 10, // Muestra los últimos 10 como en tu diseño
    });
  } catch (error) {
    console.error('Error al obtener el historial:', error.message);
    throw error;
  }
}

/**
 * Ejemplo de función para obtener datos semanales de incidencias
 */
export async function getWeeklyIncidenceData(startDate, endDate) {
  // Aquí filtras las incidencias por fecha para el contenido del Excel
  return await incidenceRepository.find({
      where: {
          // Lógica de filtrado por fechas
      }
  });
}