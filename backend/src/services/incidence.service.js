'use strict';
import { AppDataSource } from '../config/configDb.js';
import IncidenceEntity from '../entities/IncidenceEntity.js';
import {
  INCIDENCE_TYPES,
  SEVERITY_LEVELS,
  INCIDENCE_STATUS,
} from '../entities/IncidenceEntity.js';
import UserEntity from '../entities/UserEntity.js';
import BikerackEntity from '../entities/BikerackEntity.js';
import SpaceEntity from '../entities/SpaceEntity.js';
import { validateIncidenceData } from '../validations/incidence.validation.js';

const incidenceRepository = AppDataSource.getRepository(IncidenceEntity);
const userRepository = AppDataSource.getRepository(UserEntity);
const bikerackRepository = AppDataSource.getRepository(BikerackEntity);
const spaceRepository = AppDataSource.getRepository(SpaceEntity);
/////////////////////////////////////////////////////////////////////////////
//! esta función crea la incidencia
export async function createIncidenceReport(incidenceData, reporterId) {
  try {
    validateIncidenceData(incidenceData);

    const reporter = await userRepository.findOne({
      where: { id: reporterId, role: 'guardia' },
    });
    if (!reporter) throw new Error('Guardia no encontrado');

    const bikerack = await bikerackRepository.findOne({
      where: { id: incidenceData.bikerackId },
    });
    if (!bikerack) throw new Error('Bicicletero no encontrado');

    const incidenceToSave = {
      incidenceType: incidenceData.incidenceType,
      severity: incidenceData.severity,
      description: incidenceData.description.trim(),
      evidenceUrl: incidenceData.evidenceUrl || null,
      dateTimeIncident: new Date(incidenceData.dateTimeIncident),
      dateTimeReport: new Date(),
      status: INCIDENCE_STATUS.OPEN,
      reporter: reporter,
      bikerack: bikerack,
    };

    if (incidenceData.spaceId) {
      const space = await spaceRepository.findOne({
        where: { id: incidenceData.spaceId },
      });
      if (!space) throw new Error('El espacio seleccionado no existe');
      incidenceToSave.space = space;
    }

    if (incidenceData.involvedUserId) {
      const involvedUser = await userRepository.findOne({
        where: { id: incidenceData.involvedUserId },
      });
      if (!involvedUser) throw new Error('El usuario involucrado no existe');
      incidenceToSave.involvedUser = involvedUser;
    }

    const incidence = incidenceRepository.create(incidenceToSave);
    const savedIncidence = await incidenceRepository.save(incidence);

    return {
      ...savedIncidence,
      bikerack: bikerack,
      space: incidenceToSave.space || null,
      involvedUser: incidenceToSave.involvedUser || null,
    };
  } catch (error) {
    console.error('Error en createIncidenceReport:', error.message);
    throw error;
  }
}
/////////////////////////////////////////////////////////////////////////////
//! función para oobtener los tipos de incidencia
export async function getIncidenceTypes() {
  try {
    return Object.values(INCIDENCE_TYPES);
  } catch (error) {
    console.error('Error en getIncidenceTypes:', error);
    throw new Error('Error al obtener tipos de incidencia');
  }
}
/////////////////////////////////////////////////////////////////////////////
//! función para obtener los niveles de gravedad
export async function getSeverityLevels() {
  try {
    return Object.values(SEVERITY_LEVELS);
  } catch (error) {
    console.error('Error en getSeverityLevels:', error);
    throw new Error('Error al obtener niveles de gravedad');
  }
}
/////////////////////////////////////////////////////////////////////////////
//! función para obtener las incidencias reportadas por un guardia específico
export async function getIncidencesByGuard(guardId) {
  try {
    return await incidenceRepository.find({
      where: {
        reporter: { id: guardId },
      },
      order: { dateTimeReport: 'DESC' },
      relations: ['bikerack', 'involvedUser'],
    });
  } catch (error) {
    console.error('Error en getIncidencesByGuard:', error);
    throw new Error('Error al obtener incidencias del guardia');
  }
}

export async function getAllIncidences(filters = {}) {
  try {
    const { status, severity, bikerackId } = filters;
    
    const query = incidenceRepository.createQueryBuilder('incidence')
      .leftJoinAndSelect('incidence.reporter', 'reporter')
      .leftJoinAndSelect('incidence.bikerack', 'bikerack')
      .leftJoinAndSelect('incidence.involvedUser', 'involvedUser')
      .leftJoinAndSelect('incidence.space', 'space')
      .orderBy('incidence.dateTimeReport', 'DESC');

    if (status) query.andWhere('incidence.status = :status', { status });
    if (severity) query.andWhere('incidence.severity = :severity', { severity });
    if (bikerackId) query.andWhere('incidence.bikerackId = :bikerackId', { bikerackId });

    return await query.getMany();
  } catch (error) {
    console.error('Error en getAllIncidences:', error);
    throw new Error('Error al recuperar el historial de incidencias');
  }
}
export async function exportIncidencesToExcel(incidences) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Plan de Reparaciones');

    // Configuración de Columnas
    sheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Fecha Reporte', key: 'date', width: 20 },
        { header: 'Bicicletero', key: 'bikerack', width: 25 },
        { header: 'Tipo', key: 'type', width: 20 },
        { header: 'Gravedad', key: 'severity', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Descripción', key: 'desc', width: 40 },
    ];

    // Estilo al encabezado
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE67E22' } // Naranja para resaltar "Atención"
    };

    // Agregar los datos
    incidences.forEach(inc => {
        const row = sheet.addRow({
            id: inc.id,
            date: inc.dateTimeReport.toLocaleString(),
            bikerack: inc.bikerack?.name || 'N/A',
            type: inc.incidenceType,
            severity: inc.severity,
            status: inc.status,
            desc: inc.description
        });

        // Formato condicional: Si la gravedad es ALTA, poner el texto en rojo
        if (inc.severity.toLowerCase() === 'alta') {
            row.getCell('severity').font = { color: { argb: 'FFFF0000' }, bold: true };
        }
    });

    return await workbook.xlsx.writeBuffer();
}
//! Resolver una incidencia (Acción del Admin)
export async function resolveIncidence(incidenceId, adminId, resolutionData) {
  try {
    const incidence = await incidenceRepository.findOne({ 
        where: { id: incidenceId },
        relations: ['reporter'] 
    });

    if (!incidence) throw new Error('Incidencia no encontrada');
    
    // Actualizamos los campos de resolución
    incidence.status = INCIDENCE_STATUS.RESOLVED; // Asegúrate de tenerlo en tus constantes
    incidence.adminComments = resolutionData.comments;
    incidence.resolvedAt = new Date();
    incidence.resolvedBy = { id: adminId }; // Si tienes la relación en tu Entidad

    return await incidenceRepository.save(incidence);
  } catch (error) {
    console.error('Error al resolver incidencia:', error);
    throw error;
  }
}