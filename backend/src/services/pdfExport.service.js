'use strict';

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class PDFExportService {
    constructor() {
        // Directorio donde se guardarán los PDFs
        this.pdfDirectory = path.join(process.cwd(), 'public', 'reports');
        
        // Crear directorio si no existe
        if (!fs.existsSync(this.pdfDirectory)) {
            fs.mkdirSync(this.pdfDirectory, { recursive: true });
        }
    }

    // ==================== GENERAR PDF DE REPORTE SEMANAL ====================
    async generateWeeklyReportPDF(reportData) {
        return new Promise((resolve, reject) => {
            try {
                const fileName = `reporte-semanal-${Date.now()}.pdf`;
                const filePath = path.join(this.pdfDirectory, fileName);
                
                const doc = new PDFDocument({ margin: 50 });
                const stream = fs.createWriteStream(filePath);
                
                doc.pipe(stream);

                // ===== ENCABEZADO =====
                this.addHeader(doc, reportData);
                
                // ===== RESUMEN =====
                this.addSummary(doc, reportData.summary);
                
                // ===== ESTADÍSTICAS DIARIAS =====
                this.addDailyStats(doc, reportData.dailyStats);
                
                // ===== ESTADÍSTICAS POR BICICLETERO =====
                this.addBikerackStats(doc, reportData.bikerackStats);
                
                // ===== PIE DE PÁGINA =====
                this.addFooter(doc, reportData);

                doc.end();

                stream.on('finish', () => {
                    resolve({
                        success: true,
                        fileName: fileName,
                        filePath: filePath,
                        downloadUrl: `/reports/${fileName}`
                    });
                });

                stream.on('error', (error) => {
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    // ==================== ENCABEZADO DEL PDF ====================
    addHeader(doc, reportData) {
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text('📊 REPORTE SEMANAL', { align: 'center' });
        
        doc.fontSize(14)
           .font('Helvetica')
           .text(reportData.period.formatted, { align: 'center' });
        
        doc.moveDown(1.5);
        
        // Línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke();
        
        doc.moveDown(1);
    }

    // ==================== RESUMEN ====================
    addSummary(doc, summary) {
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('📈 RESUMEN GENERAL', { underline: true });
        
        doc.moveDown(0.5);
        
        doc.fontSize(12)
           .font('Helvetica');
        
        const summaryItems = [
            `• Movimientos totales: ${summary.totalMovements}`,
            `• Check-ins: ${summary.totalCheckins} | Check-outs: ${summary.totalCheckouts}`,
            `• Usuarios únicos: ${summary.uniqueUsers}`,
            `• Bicicletas únicas: ${summary.uniqueBicycles}`,
            `• Promedio diario: ${summary.averageDailyUsage} movimientos`
        ];
        
        summaryItems.forEach(item => {
            doc.text(item);
            doc.moveDown(0.3);
        });
        
        doc.moveDown(1);
    }

    // ==================== ESTADÍSTICAS DIARIAS ====================
    addDailyStats(doc, dailyStats) {
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('📅 ESTADÍSTICAS DIARIAS', { underline: true });
        
        doc.moveDown(0.5);
        
        doc.fontSize(11)
           .font('Helvetica');
        
        dailyStats.forEach(day => {
            const line = `${day.dayName} ${day.date}: ${day.total} movimientos (${day.checkins} entradas, ${day.checkouts} salidas) - ${day.uniqueUsers} usuarios`;
            doc.text(line);
            doc.moveDown(0.3);
        });
        
        doc.moveDown(1);
    }

    // ==================== ESTADÍSTICAS POR BICICLETERO ====================
    addBikerackStats(doc, bikerackStats) {
        // Verificar si necesitamos nueva página
        if (doc.y > 650) {
            doc.addPage();
        }
        
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('📍 USO POR BICICLETERO', { underline: true });
        
        doc.moveDown(0.5);
        
        doc.fontSize(11)
           .font('Helvetica');
        
        bikerackStats.forEach((bikerack, index) => {
            const line = `${index + 1}. ${bikerack.name}: ${bikerack.total} movimientos (${bikerack.percentage}%)`;
            doc.text(line);
            doc.fontSize(10)
               .fillColor('gray')
               .text(`   ${bikerack.checkins} check-ins | ${bikerack.checkouts} check-outs | ${bikerack.uniqueUsers} usuarios`, { indent: 20 });
            doc.fillColor('black')
               .fontSize(11);
            doc.moveDown(0.4);
        });
        
        doc.moveDown(1);
    }

    // ==================== PIE DE PÁGINA ====================
    addFooter(doc, reportData) {
        const pageHeight = doc.page.height;
        
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('gray')
           .text(
               `Reporte generado el ${new Date(reportData.generatedAt).toLocaleString('es-CL')}`,
               50,
               pageHeight - 50,
               { align: 'center' }
           );
        
        doc.text(
            `ID: ${reportData.reportId}`,
            50,
            pageHeight - 35,
            { align: 'center' }
        );
    }

    // ==================== ELIMINAR PDFs ANTIGUOS ====================
    async cleanOldReports(daysOld = 30) {
        try {
            const files = fs.readdirSync(this.pdfDirectory);
            const now = Date.now();
            const maxAge = daysOld * 24 * 60 * 60 * 1000;
            
            let deletedCount = 0;
            
            files.forEach(file => {
                const filePath = path.join(this.pdfDirectory, file);
                const stats = fs.statSync(filePath);
                const age = now - stats.mtime.getTime();
                
                if (age > maxAge) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                }
            });
            
            return {
                success: true,
                deletedFiles: deletedCount
            };
        } catch (error) {
            console.error('Error limpiando reportes antiguos:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new PDFExportService();