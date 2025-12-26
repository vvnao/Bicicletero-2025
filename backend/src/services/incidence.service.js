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

const incidenceRepository = AppDataSource.getRepository(IncidenceEntity);
const userRepository = AppDataSource.getRepository(UserEntity);
const bikerackRepository = AppDataSource.getRepository(BikerackEntity);
const spaceRepository = AppDataSource.getRepository(SpaceEntity);
/////////////////////////////////////////////////////////////////////////////
//! esta función es para validar los datos de incidencia
function validateIncidenceData(data) {
  //* campos obligatorios
  const requiredFields = [
    'incidenceType',
    'bikerackId',
    'severity',
    'description',
    'dateTimeIncident',
  ];

  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Campos obligatorios faltantes: ${missingFields.join(', ')}`
    );
  }

  //* validar que el tipo de incidencia sea válido
  const validTypes = Object.values(INCIDENCE_TYPES);
  if (!validTypes.includes(data.incidenceType)) {
    throw new Error(
      `Tipo de incidencia no válido. Valores permitidos: ${validTypes.join(
        ', '
      )}`
    );
  }

  //* validar que la gravedad sea válida
  const validSeverities = Object.values(SEVERITY_LEVELS);
  if (!validSeverities.includes(data.severity)) {
    throw new Error(
      `Nivel de gravedad no válido. Valores permitidos: ${validSeverities.join(
        ', '
      )}`
    );
  }

  //* validar que la fecha del incidente no sea futura
  const incidentDate = new Date(data.dateTimeIncident);
  if (incidentDate > new Date()) {
    throw new Error('La fecha del incidente no puede ser futura');
  }

  //* validar longitud mínima de descripción
  if (data.description.trim().length < 10) {
    throw new Error('La descripción debe tener al menos 10 caracteres');
  }

  return true;
}
/////////////////////////////////////////////////////////////////////////////
//! esta función crea la incidencia
export async function createIncidenceReport(incidenceData, reporterId) {
  try {
    validateIncidenceData(incidenceData);

    const reporter = await userRepository.findOne({
      where: { id: reporterId, role: 'guardia' },
    });

    if (!reporter) {
      throw new Error('Guardia no encontrado');
    }

    const bikerack = await bikerackRepository.findOne({
      where: { id: incidenceData.bikerackId },
    });

    if (!bikerack) {
      throw new Error('Bicicletero no encontrado');
    }

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
      if (space) {
        incidenceToSave.space = space;
      }
    }

    if (incidenceData.involvedUserId) {
      const involvedUser = await userRepository.findOne({
        where: { id: incidenceData.involvedUserId },
      });
      if (involvedUser) {
        incidenceToSave.involvedUser = involvedUser;
      }
    }

    const incidence = incidenceRepository.create(incidenceToSave);
    const savedIncidence = await incidenceRepository.save(incidence);

    return savedIncidence;
  } catch (error) {
    console.error('Error en createIncidenceReport:', error.message);
    throw new Error(`Error al crear incidencia: ${error.message}`);
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
