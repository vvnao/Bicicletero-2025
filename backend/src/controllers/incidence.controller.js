'use strict';
import { AppDataSource } from '../config/configDb.js';
import Bikerack from '../entities/BikerackEntity.js';
import SpaceEntity from '../entities/SpaceEntity.js';
import UserEntity from '../entities/UserEntity.js';
import EvidenceEntity from '../entities/EvidenceEntity.js';
import { formatRut } from '../helpers/rut.helper.js';
import { isValidChileanRut } from '../validations/user.validation.js';
import {
  createIncidenceReport,
  getIncidenceTypes,
  getSeverityLevels,
  getIncidencesByGuard,
  deleteIncidence,
} from '../services/incidence.service.js';
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from '../Handlers/responseHandlers.js';
import {
  transformEvidenceUrls,
  transformObjectUrls,
  buildFileUrl,
} from '../helpers/url.helper.js';
import IncidenceEntity from '../entities/IncidenceEntity.js';

const bikerackRepository = AppDataSource.getRepository(Bikerack);
const spaceRepository = AppDataSource.getRepository(SpaceEntity);
const userRepository = AppDataSource.getRepository(UserEntity);
const incidenceRepository = AppDataSource.getRepository(IncidenceEntity);
const evidenceRepository = AppDataSource.getRepository(EvidenceEntity);
/////////////////////////////////////////////////////////////////////////////
//! crear incidencia
export async function createIncidenceReportController(req, res) {
  try {
    const incidenceData = req.body;
    const reporterId = req.user.id;

    const incidence = await createIncidenceReport(incidenceData, reporterId);

    if (req.files && req.files.evidence) {
      const evidenceFiles = req.files.evidence;
      const evidences = [];

      for (let i = 0; i < evidenceFiles.length; i++) {
        const file = evidenceFiles[i];

        const evidenceUrl = buildFileUrl(req, file.filename, 'evidence');

        const evidence = evidenceRepository.create({
          url: evidenceUrl,
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          order: i,
          incidence: incidence,
        });

        const savedEvidence = await evidenceRepository.save(evidence);
        evidences.push(savedEvidence);
      }

      incidence.evidences = evidences;
    }

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
      evidences: incidence.evidences || [],
    });
  } catch (error) {
    if (error.message.includes('Campos obligatorios')) {
      return handleErrorClient(res, 400, error.message);
    }
    if (error.message.includes('no válido')) {
      return handleErrorClient(res, 400, error.message);
    }
    if (error.message.includes('no puede ser futura')) {
      return handleErrorClient(res, 400, error.message);
    }
    if (error.message.includes('al menos 10 caracteres')) {
      return handleErrorClient(res, 400, error.message);
    }
    if (error.message.includes('número válido')) {
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

    const transformedIncidences = incidences.map((incidence) => ({
      ...incidence,
      evidences: transformEvidenceUrls(incidence.evidences, req),
    }));

    return handleSuccess(
      res,
      200,
      'Reportes de incidencias del guardia',
      transformedIncidences
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
      return res.status(400).json({
        success: false,
        message: 'Debe ingresar un RUT para buscar.',
      });
    }

    const rutInput = rut.trim();
    const formattedRut = formatRut(rutInput);

    if (!isValidChileanRut(formattedRut)) {
      return res.status(400).json({
        success: false,
        message:
          'Formato de RUT inválido. Ejemplos válidos: 12345678-9, 12.345.678-9',
      });
    }

    const user = await userRepository.findOne({
      where: {
        rut: formattedRut,
        role: 'user',
        isActive: true,
      },
      select: ['id', 'names', 'lastName', 'rut', 'email'],
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Usuario no encontrado',
        data: {
          found: false,
          message: `El RUT ${formattedRut} no está registrado.`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario encontrado',
      data: {
        found: true,
        user: {
          id: user.id,
          names: user.names,
          lastName: user.lastName,
          rut: user.rut,
          email: user.email,
          fullName: `${user.names} ${user.lastName}`,
        },
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al buscar usuario',
      error: error.message,
    });
  }
}
/////////////////////////////////////////////////////////////////////////////
//! eliminar incidencia
export async function deleteIncidenceController(req, res) {
  try {
    const { id } = req.params;
    const guardId = req.user.id;

    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, 'ID de incidencia inválido');
    }

    const result = await deleteIncidence(parseInt(id), guardId);

    return handleSuccess(res, 200, result.message, {
      deletedId: result.deletedId,
      success: true,
    });
  } catch (error) {
    if (error.message.includes('No tienes permiso')) {
      return handleErrorClient(res, 403, error.message);
    }
    if (error.message.includes('no encontrada')) {
      return handleErrorClient(res, 404, error.message);
    }

    return handleErrorServer(
      res,
      500,
      'Error al eliminar la incidencia',
      error.message
    );
  }
}
/////////////////////////////////////////////////////////////////////////////
//! obtener una incidencia específica por ID
export async function getIncidenceByIdController(req, res) {
  try {
    const { id } = req.params;
    const guardId = req.user.id;

    const incidence = await incidenceRepository.findOne({
      where: {
        id: parseInt(id),
        reporter: { id: guardId },
      },
      relations: ['reporter', 'bikerack', 'space', 'involvedUser', 'evidences'],
    });

    if (!incidence) {
      return handleErrorClient(
        res,
        404,
        'Incidencia no encontrada o no tienes permiso'
      );
    }

    if (incidence.evidences) {
      incidence.evidences = transformEvidenceUrls(incidence.evidences, req);
    }

    const responseIncidence = {
      ...incidence,
      dateTimeReport: incidence.dateTimeReport
        ? incidence.dateTimeReport.toISOString()
        : null,
      dateTimeIncident: incidence.dateTimeIncident
        ? incidence.dateTimeIncident.toISOString()
        : null,
      evidences: transformedEvidences || [],
    };

    return handleSuccess(res, 200, 'Incidencia obtenida', responseIncidence);
  } catch (error) {
    console.error('Error en getIncidenceByIdController:', error);
    return handleErrorServer(
      res,
      500,
      'Error al obtener la incidencia',
      error.message
    );
  }
}