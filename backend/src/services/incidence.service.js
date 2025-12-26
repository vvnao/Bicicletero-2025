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
