import { AppDataSource } from '../config/configDb.js';
import { UserEntity } from '../entities/UserEntity.js';
import { BicycleEntity } from '../entities/BicycleEntity.js';
import Bikerack from '../entities/BikerackEntity.js';
import { GuardAssignmentEntity } from '../entities/GuardAssignmentEntity.js';
import { createHistoryRecord } from '../services/history.service.js';
import {
  getBikeracksSummary,
  getBikerackDetail,
} from '../services/bikerackDashboard.service.js';
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from '../Handlers/responseHandlers.js';

const bikerackRepository = AppDataSource.getRepository(Bikerack);
const userRepository = AppDataSource.getRepository(UserEntity);
const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
const guardAssignmentRepository = AppDataSource.getRepository(
  GuardAssignmentEntity
);
//////////////////////////////////////////////////////////////////////////////////////////////////
//! PARA EL PANEL DE MONITOREO
export async function getDashboard(req, res) {
  try {
    const bikeracksSummary = await getBikeracksSummary();

    handleSuccess(
      res,
      200,
      'Dashboard obtenido exitosamente!',
      bikeracksSummary
    );
  } catch (error) {
    console.error('Error en getDashboard:', error);
    handleErrorServer(res, 500, 'Error al obtener el dashboard', error.message);
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//! PARA LA VISTA DETALLADA DE CADA BICICLETERO
export async function getBikerackSpaces(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(
        res,
        400,
        'ID de bicicletero inválido. Debe ser un número.'
      );
    }

    const bikerackId = parseInt(id);
    const bikerackDetail = await getBikerackDetail(bikerackId);

    handleSuccess(
      res,
      200,
      'Espacios del bicicletero obtenidos exitosamente!',
      bikerackDetail
    );
  } catch (error) {
    console.error(`[BikerackDetail Error] ID ${req.params.id}:`, error.message);

    if (error.message.includes('no encontrado')) {
      return handleErrorClient(res, 404, 'El bicicletero solicitado no existe');
    }

    handleErrorServer(
      res,
      500,
      'Error interno al obtener el detalle del bicicletero'
    );
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//* esto es de say
export async function listBikeracks(req, res) {
  try {
    const racks = await getBikeracks();
    return handleSuccess(res, 200, 'Bicicleteros obtenidos', racks);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

export async function assignGuardController(req, res) {
  try {
    const { bikerackId, guardId } = req.params;
    const result = await assignGuard(parseInt(bikerackId), parseInt(guardId));
    return handleSuccess(res, 200, 'Guardia asignado correctamente', result);
  } catch (error) {
    return handleErrorClient(res, 400, error.message);
  }
}

export async function storeBicycleController(req, res) {
  try {
    const { bikerackId, bicycleId } = req.params;
    const result = await storeBicycle(
      parseInt(bikerackId),
      parseInt(bicycleId)
    );
    return handleSuccess(
      res,
      200,
      'Bicicleta almacenada en el bicicletero',
      result
    );
  } catch (error) {
    return handleErrorClient(res, 400, error.message);
  }
}

export async function removeBicycleController(req, res) {
  try {
    const { bicycleId } = req.params;
    const result = await removeBicycle(parseInt(bicycleId));
    return handleSuccess(
      res,
      200,
      'Bicicleta retirada del bicicletero',
      result
    );
  } catch (error) {
    return handleErrorClient(res, 400, error.message);
  }
}

export async function getBikerackGuards(req, res) {
  try {
    const { bikerackId } = req.params;

    // Lógica para obtener guardias asignados
    const assignments = await guardAssignmentRepository.find({
      where: {
        bikerack: { id: bikerackId },
        status: 'activo',
      },
      relations: ['guard', 'guard.user'],
    });

    const guards = assignments.map((assignment) => ({
      id: assignment.guard.id,
      userId: assignment.guard.userId,
      name: `${assignment.guard.names} ${assignment.guard.lastName}`,
      email: assignment.guard.email,
      phone: assignment.guard.phone,
      isAvailable: assignment.guard.isAvailable,
      assignmentId: assignment.id,
      assignedAt: assignment.created_at,
    }));

    return res.status(200).json({
      success: true,
      data: guards,
    });
  } catch (error) {
    console.error('Error en getBikerackGuards:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// ✅ Listar bicicleteros con guardias disponibles
export async function listBikeracksWithGuards(req, res) {
  try {
    const racks = await bikerackRepository.find({
      relations: ['guardAssignments', 'guardAssignments.guard'],
    });

    const racksWithGuards = racks.map((rack) => {
      const activeGuards = rack.guardAssignments.filter(
        (a) => a.status === 'activo'
      );

      return {
        id: rack.id,
        name: rack.name,
        capacity: rack.capacity,
        activeGuardsCount: activeGuards.length,
        guards: activeGuards.map((assignment) => ({
          id: assignment.guard.id,
          name: `${assignment.guard.names} ${assignment.guard.lastName}`,
          phone: assignment.guard.phone,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      data: racksWithGuards,
    });
  } catch (error) {
    console.error('Error en listBikeracksWithGuards:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
//* LISTAR TODOS LOS BICICLETEROS
export async function listBikeracks(req, res) {
  try {
    const racks = await bikerackRepository.find({
      relations: ['spaces'], // Cargar espacios si los necesitas
    });

    // Agregar información de ocupación a cada bicicletero
    const racksWithOccupancy = await Promise.all(
      racks.map(async (rack) => {
        const used = await bicycleRepository.count({
          where: { bikerack: { id: rack.id } },
        });

        // Cargar guardias asignados
        const activeAssignments = await guardAssignmentRepository.find({
          where: {
            bikerack: { id: rack.id },
            status: 'activo',
          },
          relations: ['guard'],
        });

        return {
          id: rack.id,
          name: rack.name,
          capacity: rack.capacity,
          usedCapacity: used,
          availableCapacity: rack.capacity - used,
          occupancyRate: ((used / rack.capacity) * 100).toFixed(2) + '%',
          activeGuards: activeAssignments.map((assignment) => ({
            id: assignment.guard.id,
            name: `${assignment.guard.names} ${assignment.guard.lastName}`,
            email: assignment.guard.email,
          })),
          createdAt: rack.created_at,
          updatedAt: rack.updated_at,
        };
      })
    );

    return handleSuccess(
      res,
      200,
      'Bicicleteros obtenidos',
      racksWithOccupancy
    );
  } catch (error) {
    console.error('Error en listBikeracks:', error);
    return handleErrorServer(res, 500, error.message);
  }
}

//*VERIFICACION
async function assignGuardInternal(bikerackId, guardId) {
  const guardRepo = AppDataSource.getRepository(UserEntity);
  const bikerackRepo = AppDataSource.getRepository(Bikerack);
  const assignmentRepo = AppDataSource.getRepository(GuardAssignmentEntity);

  const guard = await guardRepo.findOneBy({ id: guardId });
  if (!guard) throw new Error('El guardia no existe');

  // Verificar que el bicicletero existe
  const bikerack = await bikerackRepo.findOneBy({ id: bikerackId });
  if (!bikerack) throw new Error('El bicicletero no existe');

  // Verificar que no haya asignación activa
  const existing = await assignmentRepo.findOneBy({
    guard: { id: guardId },
    bikerack: { id: bikerackId },
    status: 'activo',
  });
  if (existing)
    throw new Error(
      'El guardia ya tiene asignación activa en este bicicletero'
    );

  const newAssignment = assignmentRepo.create({
    guard: { id: guardId },
    bikerack: { id: bikerackId },
    status: 'activo',
  });

  await assignmentRepo.save(newAssignment);

  const assignmentWithRelations = await assignmentRepo.findOne({
    where: { id: newAssignment.id },
    relations: ['guard', 'bikerack'],
  });

  return {
    message: 'Guardia asignado correctamente',
    assignment: assignmentWithRelations,
  };
}

//* GUARDAR BICICLETA EN BICICLETERO
export async function storeBicycleInBikerack(req, res) {
  try {
    const { bikerackId, bicycleId, userId } = req.body;

    if (!bikerackId || !bicycleId || !userId) {
      return handleErrorClient(
        res,
        400,
        'Se requieren bikerackId, bicycleId y userId'
      );
    }

    const result = await storeBicycleInternal(bikerackId, bicycleId, userId);
    return handleSuccess(res, 200, result.message, result.bicycle);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

//* REMOVER BICICLETA DEL BICICLETERO
export async function removeBicycleFromBikerack(req, res) {
  try {
    const { bicycleId, userId } = req.body;

    if (!bicycleId || !userId) {
      return handleErrorClient(res, 400, 'Se requieren bicycleId y userId');
    }

    const result = await removeBicycleInternal(bicycleId, userId);
    return handleSuccess(res, 200, result.message, result.bicycle);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

//* GENERAR REPORTE SEMANAL
export async function generateWeeklyReport(req, res) {
  try {
    const report = await generateWeeklyReportData();
    return handleSuccess(
      res,
      200,
      'Reporte semanal generado exitosamente',
      report
    );
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

//* LISTAR TODOS LOS BICICLETEROS CON OCUPACIÓN
async function getBikeracksData() {
  const racks = await bikerackRepository.find({
    relations: ['guardAssignments', 'guardAssignments.guard', 'spaces'],
  });

  for (const rack of racks) {
    const used = await bicycleRepository.count({
      where: { bikerack: { id: rack.id } },
    });
    rack.usedCapacity = used;
    rack.availableCapacity = rack.capacity - used;
  }

  return racks;
}
