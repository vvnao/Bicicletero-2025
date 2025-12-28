// src/services/report.service.js
import { AppDataSource } from '../config/configDb.js';
import ReportEntity from '../entities/ReportEntity.js'; // Usa la entidad completa

const reportRepository = AppDataSource.getRepository(ReportEntity);

export async function saveReportToHistory(reportData, admin) {
  try {
    const newEntry = reportRepository.create({
      reportType: reportData.type,
      title: `Reporte Semanal: ${reportData.type}`,
      periodStart: new Date(reportData.startDate), 
      periodEnd: new Date(reportData.endDate),
      data: reportData.data || {}, // Guardamos las stats aquí
      generatedBy: admin.id, // Tu entidad espera el ID del admin
      status: 'generated'
    });

    return await reportRepository.save(newEntry);
  } catch (error) {
    console.error('Error al guardar el registro:', error.message);
    throw error;
  }
}