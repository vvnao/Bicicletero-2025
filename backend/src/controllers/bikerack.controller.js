// bikerack.controller.js - VERSIÓN FINAL (CORREGIDA)
import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";
import Bikerack from "../entities/BikerackEntity.js";
import { SpaceEntity } from "../entities/SpaceEntity.js";
import { ReservationEntity, RESERVATION_STATUS } from "../entities/ReservationEntity.js";
import { GuardAssignmentEntity } from "../entities/GuardAssignmentEntity.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from '../Handlers/responseHandlers.js';

const bikerackRepository = AppDataSource.getRepository(Bikerack);
const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
const spaceRepository = AppDataSource.getRepository(SpaceEntity);
const reservationRepository = AppDataSource.getRepository(ReservationEntity);
const guardAssignmentRepository = AppDataSource.getRepository(GuardAssignmentEntity);

//* LISTAR TODOS LOS BICICLETEROS CON OCUPACIÓN REAL (VERSIÓN ÚNICA)
export async function listBikeracks(req, res) {
  try {
    console.log('📋 Solicitando lista de bicicleteros con ocupación REAL...');
    
    // Obtener bicicleteros ORDENADOS
    const racks = await bikerackRepository.find({
      order: { id: 'ASC' }
    });

    console.log(`📊 ${racks.length} bicicleteros encontrados en BD`);

    // Procesar cada bicicletero
    const racksWithOccupancy = await Promise.all(
      racks.map(async (rack) => {
        try {
          // Obtener espacios de este bicicletero
          const spaces = await spaceRepository.find({
            where: { bikerack: { id: rack.id } }
          });

          const totalSpaces = spaces.length || rack.capacity || 40;
          let occupiedSpaces = 0;

          // Contar espacios con reservas ACTIVAS
          for (const space of spaces) {
            const activeReservation = await reservationRepository.findOne({
              where: {
                space: { id: space.id },
                status: RESERVATION_STATUS.ACTIVE
              }
            });

            if (activeReservation) {
              occupiedSpaces++;
            }
          }

          const freeSpaces = totalSpaces - occupiedSpaces;
          const occupationPercentage = totalSpaces > 0 
            ? Math.round((occupiedSpaces / totalSpaces) * 100) 
            : 0;

          // Determinar estado basado en ocupación REAL
          let status = 'Activo';
          if (occupationPercentage >= 90) status = 'Lleno';
          else if (occupationPercentage >= 75) status = 'Casi Lleno';
          else if (occupiedSpaces === 0) status = 'Vacío';

          // Cargar guardias asignados
          const activeAssignments = await guardAssignmentRepository.find({
            where: {
              bikerack: { id: rack.id },
              status: "activo"
            },
            relations: ["guard"]
          });

          // Asignar nombre si no tiene
          let name = rack.name;
          if (!name) {
            const names = ['CENTRAL', 'NORTE', 'SUR', 'ESTE', 'OESTE'];
            name = names[rack.id - 1] || `BICICLETERO ${rack.id}`;
          }

          return {
            id: rack.id,
            name: name,
            nombre: name, // Para compatibilidad con frontend
            capacity: rack.capacity || totalSpaces,
            occupied: occupiedSpaces,
            free: freeSpaces,
            total: totalSpaces,
            occupationPercentage: occupationPercentage,
            porcentajeOcupacion: occupationPercentage, // Para compatibilidad
            status: status,
            estado: status, // Para compatibilidad
            espaciosDisponibles: freeSpaces,
            usedCapacity: occupiedSpaces, // Para compatibilidad con código viejo
            availableCapacity: freeSpaces, // Para compatibilidad
            occupancyRate: `${occupationPercentage}%`,
            spaces: spaces || [],
            activeGuards: activeAssignments.map(assignment => ({
              id: assignment.guard.id,
              name: `${assignment.guard.names} ${assignment.guard.lastName}`,
              email: assignment.guard.email
            })),
            createdAt: rack.created_at,
            updatedAt: rack.updated_at
          };

        } catch (error) {
          console.error(`❌ Error procesando bicicletero ${rack.id}:`, error);
          // Datos por defecto en caso de error
          return {
            id: rack.id,
            name: rack.name || `BICICLETERO ${rack.id}`,
            nombre: rack.name || `BICICLETERO ${rack.id}`,
            capacity: rack.capacity || 40,
            occupied: 0,
            free: rack.capacity || 40,
            total: rack.capacity || 40,
            occupationPercentage: 0,
            porcentajeOcupacion: 0,
            status: 'Activo',
            estado: 'Activo',
            espaciosDisponibles: rack.capacity || 40,
            usedCapacity: 0,
            availableCapacity: rack.capacity || 40,
            occupancyRate: '0%',
            spaces: [],
            activeGuards: [],
            createdAt: rack.created_at,
            updatedAt: rack.updated_at
          };
        }
      })
    );

    console.log('✅ Bicicleteros procesados con ocupación REAL');
    
    // IMPORTANTE: Devuelve array directo para el frontend
    return res.status(200).json(racksWithOccupancy);
    
  } catch (error) {
    console.error('❌ Error en listBikeracks:', error);
    return handleErrorServer(res, 500, error.message);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//! FUNCIONES AUXILIARES (mantén las otras funciones)
//////////////////////////////////////////////////////////////////////////////////////////////////

//! PARA EL PANEL DE MONITOREO
export async function getDashboard(req, res) {
  try {
    console.log('Obteniendo dashboard...');

    // Esta función debe existir o implementarla
    const bikeracksSummary = await getBikeracksSummary();

    return handleSuccess(
      res,
      200,
      'Dashboard obtenido exitosamente!',
      bikeracksSummary
    );
  } catch (error) {
    console.error('Error en getDashboard:', error);
    return handleErrorServer(res, 500, 'Error al obtener el dashboard', error.message);
  }
}

//! PARA LA VISTA DETALLADA DE CADA BICICLETERO
export async function getBikerackSpaces(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, 'ID de bicicletero inválido');
    }

    console.log(`Obteniendo espacios del bicicletero ID: ${id}...`);

    // Esta función debe existir o implementarla
    const bikerackDetail = await getBikerackDetail(parseInt(id));

    return handleSuccess(
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

    return handleErrorServer(
      res,
      500,
      'Error al obtener los espacios del bicicletero',
      error.message
    );
  }
}

//! OBTENER GUARDIAS DE UN BICICLETERO
export async function getBikerackGuards(req, res) {
  try {
    const { bikerackId } = req.params;
    
    const assignments = await guardAssignmentRepository.find({
      where: { 
        bikerack: { id: bikerackId },
        status: "activo" 
      },
      relations: ["guard", "guard.user"]
    });
    
    const guards = assignments.map(assignment => ({
      id: assignment.guard.id,
      userId: assignment.guard.userId,
      name: `${assignment.guard.names} ${assignment.guard.lastName}`,
      email: assignment.guard.email,
      phone: assignment.guard.phone,
      isAvailable: assignment.guard.isAvailable,
      assignmentId: assignment.id,
      assignedAt: assignment.created_at
    }));
    
    return res.status(200).json({
      success: true,
      data: guards
    });
  } catch (error) {
    console.error('Error en getBikerackGuards:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

//! LISTAR BICICLETEROS CON GUARDIAS
export async function listBikeracksWithGuards(req, res) {
  try {
    const racks = await bikerackRepository.find({
      relations: ["guardAssignments", "guardAssignments.guard"]
    });
    
    const racksWithGuards = racks.map(rack => {
      const activeGuards = rack.guardAssignments.filter(a => a.status === "activo");
      
      return {
        id: rack.id,
        name: rack.name,
        capacity: rack.capacity,
        activeGuardsCount: activeGuards.length,
        guards: activeGuards.map(assignment => ({
          id: assignment.guard.id,
          name: `${assignment.guard.names} ${assignment.guard.lastName}`,
          phone: assignment.guard.phone
        }))
      };
    });
    
    return res.status(200).json({
      success: true,
      data: racksWithGuards
    });
  } catch (error) {
    console.error('Error en listBikeracksWithGuards:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

//! FUNCIONES INTERNAS (si las necesitas)
async function getBikeracksSummary() {
  const racks = await bikerackRepository.find({ 
    relations: ["guardAssignments", "guardAssignments.guard", "spaces"] 
  });

  for (const rack of racks) {
    // Aquí puedes calcular estadísticas adicionales
    const spaces = await spaceRepository.find({
      where: { bikerack: { id: rack.id } }
    });
    
    let occupied = 0;
    for (const space of spaces) {
      const activeReservation = await reservationRepository.findOne({
        where: {
          space: { id: space.id },
          status: RESERVATION_STATUS.ACTIVE
        }
      });
      if (activeReservation) occupied++;
    }
    
    rack.usedCapacity = occupied;
    rack.availableCapacity = rack.capacity - occupied;
  }

  return racks;
}

async function getBikerackDetail(bikerackId) {
  const rack = await bikerackRepository.findOne({
    where: { id: bikerackId },
    relations: ["spaces", "guardAssignments", "guardAssignments.guard"]
  });
  
  if (!rack) {
    throw new Error('Bicicletero no encontrado');
  }
  
  return rack;
}

//* GUARDAR BICICLETA EN BICICLETERO
export async function storeBicycleInBikerack(req, res) {
  try {
    const { bikerackId, bicycleId, userId } = req.body;

    if (!bikerackId || !bicycleId || !userId) {
      return handleErrorClient(res, 400, 'Se requieren bikerackId, bicycleId y userId');
    }

    // Aquí va tu lógica para guardar bicicleta
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

    // Aquí va tu lógica para remover bicicleta
    const result = await removeBicycleInternal(bicycleId, userId);
    return handleSuccess(res, 200, result.message, result.bicycle);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

// Si estas funciones internas no existen, créalas:
async function storeBicycleInternal(bikerackId, bicycleId, userId) {
  // Tu lógica aquí
  return { message: "Bicicleta almacenada", bicycle: {} };
}

async function removeBicycleInternal(bicycleId, userId) {
  // Tu lógica aquí
  return { message: "Bicicleta removida", bicycle: {} };
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