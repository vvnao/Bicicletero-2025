'use strict';
import { AppDataSource } from '../config/configDb.js';
import Bikerack from '../entities/BikerackEntity.js';
import SpaceEntity from '../entities/SpaceEntity.js';
import { formatRut } from '../helpers/rut.helper.js';
import { isValidChileanRut } from '../validations/user.validation.js';

import {
  createIncidenceReport,
  getIncidenceTypes,
  getSeverityLevels,
  getIncidencesByGuard,
} from '../services/incidence.service.js';

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from '../Handlers/responseHandlers.js';

const bikerackRepository = AppDataSource.getRepository(Bikerack);
const spaceRepository = AppDataSource.getRepository(SpaceEntity);
/////////////////////////////////////////////////////////////////////////////
//! crear incidencia
export async function createIncidenceReportController(req, res) {
  try {
    const incidenceData = req.body;
    const reporterId = req.user.id;

    if (req.file) {
      incidenceData.evidenceUrl = `/uploads/evidence/${req.file.filename}`;
    }

    const incidence = await createIncidenceReport(incidenceData, reporterId);

    return handleSuccess(res, 201, 'Incidencia reportada exitosamente', {
      id: incidence.id,
      incidenceType: incidence.incidenceType,
      severity: incidence.severity,
      bikerackId: incidence.bikerack.id,
      spaceId: incidence.space ? incidence.space.id : null,
      involvedUserId: incidence.involvedUser ? incidence.involvedUser.id : null,
      dateTimeReport: incidence.dateTimeReport,
      dateTimeIncident: incidence.dateTimeIncident,
      status: incidence.status,
      evidenceUrl: incidence.evidenceUrl || null,
    });
  } catch (error) {
    console.error('Error en createIncidenceReportController:', error.message);

    if (
      error.message.includes('Campos obligatorios') ||
      error.message.includes('no válido') ||
      error.message.includes('no puede ser futura') ||
      error.message.includes('al menos 10 caracteres') ||
      error.message.includes('número válido')
    ) {
      return handleErrorClient(res, 400, error.message);
    }

    return handleErrorServer(
      res,
      500,
      'Error al crear reporte de incidencia',
      error.message
    );
  }
}
/////////////////////////////////////////////////////////////////////////////
//! obtener opciones para formulario de incidencias
export async function getIncidenceFormOptionsController(req, res) {
  try {
    const [types, severities, bikeracks] = await Promise.all([
      getIncidenceTypes(),
      getSeverityLevels(),
      bikerackRepository.find({
        select: ['id', 'name', 'capacity'],
        order: { name: 'ASC' },
      }),
    ]);

    return handleSuccess(
      res,
      200,
      'Opciones obtenidas para formulario de incidencias',
      {
        types,
        severities,
        bikeracks,
      }
    );
  } catch (error) {
    console.error('Error en getIncidenceFormOptionsController:', error);
    return handleErrorServer(
      res,
      500,
      'Error al obtener opciones del formulario',
      error.message
    );
  }
}
/////////////////////////////////////////////////////////////////////////////
//! obtener espacios de un bicicletero
export async function getBikerackSpacesController(req, res) {
  try {
    const { bikerackId } = req.params;

    const bikerack = await bikerackRepository.findOne({
      where: { id: parseInt(bikerackId) },
      select: ['id', 'name'],
    });

    if (!bikerack) {
      return handleErrorClient(res, 404, 'Bicicletero no encontrado');
    }

    const spaces = await spaceRepository.find({
      where: {
        bikerack: { id: parseInt(bikerackId) },
      },
      select: ['id', 'spaceCode', 'status'],
      order: { spaceCode: 'ASC' },
    });

    return handleSuccess(res, 200, 'Espacios del bicicletero', {
      bikerack,
      spaces,
    });
  } catch (error) {
    console.error('Error en getBikerackSpacesController:', error);
    return handleErrorServer(
      res,
      500,
      'Error al obtener espacios del bicicletero',
      error.message
    );
  }
}
/////////////////////////////////////////////////////////////////////////////
//! obtener reportes de incidencias del guardia actual
export async function getMyIncidenceReportsController(req, res) {
  try {
    const guardId = req.user.id;

    const incidences = await getIncidencesByGuard(guardId);

    return handleSuccess(
      res,
      200,
      'Reportes de incidencias del guardia',
      incidences
    );
  } catch (error) {
    console.error('Error en getMyIncidenceReportsController:', error);
    return handleErrorServer(
      res,
      500,
      'Error al obtener reportes del guardia',
      error.message
    );
  }
}
/////////////////////////////////////////////////////////////////////////////
//! buscar usuario por rut
export async function searchUserByRutController(req, res) {
  try {
    const { rut } = req.query;

    if (!rut || typeof rut !== 'string' || rut.trim().length === 0) {
      return handleErrorClient(res, 400, 'Debe ingresar un RUT para buscar.');
    }

    const rutInput = rut.trim();

    const formattedRut = formatRut(rutInput);

    if (!isValidChileanRut(formattedRut)) {
      return handleErrorClient(
        res,
        400,
        'Formato de RUT inválido. Ejemplos válidos: 12345678-9, 12.345.678-9'
      );
    }

    const user = await userRepository.findOne({
      where: {
        rut: formattedRut,
        role: 'user',
        isActive: true,
      },
      select: [
        'id',
        'names',
        'lastName',
        'rut',
        'email',
        'typePerson',
        'contact',
        'requestStatus',
      ],
    });

    if (!user) {
      return handleSuccess(res, 200, 'Usuario no encontrado en el sistema', {
        found: false,
        rutSearched: formattedRut,
        message: `El RUT ${formattedRut} no está registrado en el sistema o está inactivo.`,
      });
    }

    return handleSuccess(res, 200, 'Usuario encontrado', {
      found: true,
      user: {
        ...user,
        fullName: `${user.names} ${user.lastName}`,
      },
    });
  } catch (error) {
    return handleErrorServer(
      res,
      500,
      'Error al buscar usuario',
      error.message
    );
  }
}
