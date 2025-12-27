'use strict';

import {
  INCIDENCE_TYPES,
  SEVERITY_LEVELS,
} from '../entities/IncidenceEntity.js';

export function validateIncidenceData(data) {
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

  if (isNaN(data.bikerackId) || Number(data.bikerackId) <= 0) {
    throw new Error('El ID del bicicletero debe ser un número válido.');
  }

  if (data.spaceId && (isNaN(data.spaceId) || Number(data.spaceId) <= 0)) {
    throw new Error('El ID del espacio debe ser un número válido.');
  }

  if (
    data.involvedUserId &&
    (isNaN(data.involvedUserId) || Number(data.involvedUserId) <= 0)
  ) {
    throw new Error('El ID del usuario involucrado debe ser un número válido.');
  }

  const validTypes = Object.values(INCIDENCE_TYPES);
  if (!validTypes.includes(data.incidenceType)) {
    throw new Error(
      `Tipo de incidencia no válido. Valores permitidos: ${validTypes.join(
        ', '
      )}`
    );
  }

  const validSeverities = Object.values(SEVERITY_LEVELS);
  if (!validSeverities.includes(data.severity)) {
    throw new Error(
      `Nivel de gravedad no válido. Valores permitidos: ${validSeverities.join(
        ', '
      )}`
    );
  }

  const incidentDate = new Date(data.dateTimeIncident);
  if (isNaN(incidentDate.getTime())) {
    throw new Error('La fecha del incidente no tiene un formato válido.');
  }

  if (incidentDate > new Date()) {
    throw new Error('La fecha del incidente no puede ser futura.');
  }

  if (data.description.trim().length < 10) {
    throw new Error('La descripción debe tener al menos 10 caracteres.');
  }

  return true;
}
