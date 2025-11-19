import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";
import Bikerack from "../entities/BikeRackEntity.js";
import { GuardAssignmentEntity } from "../entities/GuardAssignmentEntity.js";
import { createHistory } from "../services/history.service.js";

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
const guardAssignmentRepository = AppDataSource.getRepository(GuardAssignmentEntity);
//////////////////////////////////////////////////////////////////////////////////////////////////
//! PARA EL PANEL DE MONITOREO
export async function getDashboard(req, res) {
  try {
    console.log('Obteniendo dashboard...');

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
      return handleErrorClient(res, 400, 'ID de bicicletero inválido');
    }

    console.log(`Obteniendo espacios del bicicletero ID: ${id}...`);

    const bikerackDetail = await getBikerackDetail(parseInt(id));

    handleSuccess(
      res,
      200,
      'Espacios del bicicletero obtenidos exitosamente!',
      bikerackDetail
    );
  } catch (error) {
    console.error('Error en getBikerackSpaces:', error);

    if (error.message.includes('no encontrado')) {
      return handleErrorClient(
        res,
        404,
        'Bicicletero no encontrado',
        error.message
      );
    }

    handleErrorServer(
      res,
      500,
      'Error al obtener los espacios del bicicletero',
      error.message
    );
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////


//* LISTAR TODOS LOS BICICLETEROS
export async function listBikeracks(req, res) {
  try {
    const racks = await bikerackRepository.find({
      relations: ["spaces"] // Cargar espacios si los necesitas
    });

    // Agregar información de ocupación a cada bicicletero
    const racksWithOccupancy = await Promise.all(
      racks.map(async (rack) => {
        const used = await bicycleRepository.count({ 
          where: { bikerack: { id: rack.id } } 
        });
        
        // Cargar guardias asignados
        const activeAssignments = await guardAssignmentRepository.find({
          where: {
            bikerack: { id: rack.id },
            status: "activo"
          },
          relations: ["guard"]
        });

        return {
          id: rack.id,
          name: rack.name,
          capacity: rack.capacity,
          usedCapacity: used,
          availableCapacity: rack.capacity - used,
          occupancyRate: ((used / rack.capacity) * 100).toFixed(2) + '%',
          activeGuards: activeAssignments.map(assignment => ({
            id: assignment.guard.id,
            name: `${assignment.guard.names} ${assignment.guard.lastName}`,
            email: assignment.guard.email
          })),
          createdAt: rack.created_at,
          updatedAt: rack.updated_at
        };
      })
    );

    return handleSuccess(res, 200, "Bicicleteros obtenidos", racksWithOccupancy);
  } catch (error) {
    console.error('Error en listBikeracks:', error);
    return handleErrorServer(res, 500, error.message);
  }
}
async function assignGuardInternal(bikerackId, guardId) {
  const guardRepo = AppDataSource.getRepository(UserEntity);
  const bikerackRepo = AppDataSource.getRepository(Bikerack);
  const assignmentRepo = AppDataSource.getRepository(GuardAssignmentEntity);


  const guard = await guardRepo.findOneBy({ id: guardId });
  if (!guard) throw new Error("El guardia no existe");

  // Verificar que el bicicletero existe
  const bikerack = await bikerackRepo.findOneBy({ id: bikerackId });
  if (!bikerack) throw new Error("El bicicletero no existe");

  // Verificar que no haya asignación activa
  const existing = await assignmentRepo.findOneBy({
    guard: { id: guardId },
    bikerack: { id: bikerackId },
    status: "activo"
  });
  if (existing) throw new Error("El guardia ya tiene asignación activa en este bicicletero");


  const newAssignment = assignmentRepo.create({
    guard: { id: guardId },  
    bikerack: { id: bikerackId }, 
    status: "activo"
  });

  await assignmentRepo.save(newAssignment);
  

  const assignmentWithRelations = await assignmentRepo.findOne({
    where: { id: newAssignment.id },
    relations: ["guard", "bikerack"]
  });

  return { 
    message: "Guardia asignado correctamente", 
    assignment: assignmentWithRelations 
  };
}
//* ASIGNAR GUARDIA A UN BICICLETERO
export async function assignGuardToBikerack(req, res) {
  try {
    const { bikerackId, guardId } = req.query; 
    if (!bikerackId || !guardId) {
      return handleErrorClient(res, 400, 'Se requieren bikerackId y guardId');
    }

    const result = await assignGuardInternal(parseInt(bikerackId), parseInt(guardId));
    return handleSuccess(res, 200, "Guardia asignado correctamente", result);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

//* GUARDAR BICICLETA EN BICICLETERO
export async function storeBicycleInBikerack(req, res) {
  try {
    const { bikerackId, bicycleId, userId } = req.body;

    if (!bikerackId || !bicycleId || !userId) {
      return handleErrorClient(res, 400, 'Se requieren bikerackId, bicycleId y userId');
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
    return handleSuccess(res, 200, 'Reporte semanal generado exitosamente', report);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

//* LISTAR TODOS LOS BICICLETEROS CON OCUPACIÓN
async function getBikeracksData() {
  const racks = await bikerackRepository.find({ 
    relations: ["guardAssignments", "guardAssignments.guard", "spaces"] 
  });

  for (const rack of racks) {
    const used = await bicycleRepository.count({ 
      where: { bikerack: { id: rack.id } } 
    });
    rack.usedCapacity = used;
    rack.availableCapacity = rack.capacity - used;
  }

  return racks;
}

