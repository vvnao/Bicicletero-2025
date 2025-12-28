// src/config/initReports.js
'use strict';

import { AppDataSource } from './configDb.js';
import { WeeklyReportEntity } from '../entities/WeeklyReportEntity.js';

export async function createSampleReports() {
  try {
    const reportRepo = AppDataSource.getRepository(WeeklyReportEntity);
    
    const count = await reportRepo.count();
    if (count > 0) {
      console.log('✅ Ya existen reportes de muestra');
      return;
    }
    
    console.log('📊 Creando reportes semanales de muestra...');
    
    const bikerackRepo = AppDataSource.getRepository('Bikerack');
    const bikeracks = await bikerackRepo.find();
    
    // Crear reportes de las últimas 4 semanas
    const reports = [];
    const now = new Date();
    
    for (let week = 1; week <= 4; week++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (week * 7));
      
      bikeracks.forEach((bikerack, index) => {
        const totalSpaces = bikerack.capacity;
        const usedSpaces = Math.floor(totalSpaces * (0.6 + (Math.random() * 0.3))); // 60-90% ocupación
        const overCapacity = usedSpaces > totalSpaces ? usedSpaces - totalSpaces : 0;
        const reassignedBikes = overCapacity > 0 ? Math.floor(overCapacity * 0.8) : 0;
        
        reports.push({
          weekNumber: week,
          weekStartDate: weekStart,
          weekEndDate: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
          bikerackId: bikerack.id,
          totalSpaces: totalSpaces,
          averageDailyUsage: usedSpaces,
          peakUsage: Math.min(totalSpaces, usedSpaces + Math.floor(Math.random() * 5)),
          overCapacityIncidents: overCapacity > 0 ? 1 : 0,
          bikesReassigned: reassignedBikes,
          notes: overCapacity > 0 
            ? `⚠️ Se sobrepasó la capacidad en ${overCapacity} espacios. Se reasignaron ${reassignedBikes} bicicletas automáticamente.`
            : '✅ Uso dentro de los límites normales.',
          generatedBy: 1, // Admin
          status: 'completed',
          createdAt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        });
      });
    }
    
    // Guardar reportes
    for (const reportData of reports) {
      const report = reportRepo.create(reportData);
      await reportRepo.save(report);
    }
    
    console.log(`✅ ${reports.length} reportes semanales creados`);
    console.log('\n📈 ESTADÍSTICAS DE REPORTES:');
    console.log('='.repeat(40));
    
    // Mostrar resumen
    const overCapacityReports = reports.filter(r => r.overCapacityIncidents > 0);
    console.log(`• Reportes con sobrecapacidad: ${overCapacityReports.length}`);
    console.log(`• Bicicletas reasignadas totales: ${reports.reduce((sum, r) => sum + r.bikesReassigned, 0)}`);
    console.log(`• Período cubierto: ${reports.length / bikeracks.length} semanas`);
    
  } catch (error) {
    console.error('❌ Error creando reportes:', error);
  }
}