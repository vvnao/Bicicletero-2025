// bikerack.controller.js - VERSIÓN CORREGIDA
import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";
import Bikerack from "../entities/BikerackEntity.js";
import { SpaceEntity } from "../entities/SpaceEntity.js";
import { ReservationEntity, RESERVATION_STATUS } from "../entities/ReservationEntity.js";
import { GuardAssignmentEntity } from "../entities/GuardAssignmentEntity.js";
import historyService from '../services/history.service.js';
import { HISTORY_TYPES } from '../entities/HistoryEntity.js';

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
const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
const guardAssignmentRepository = AppDataSource.getRepository(GuardAssignmentEntity);

//////////////////////////////////////////////////////////////////////////////////////////////////

//! PARA EL PANEL DE MONITOREO
export async function getDashboard(req, res) {
  try {
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
    const { bikerackId } = req.params;

    if (!bikerackId || isNaN(parseInt(bikerackId))) {
      return handleErrorClient(
        res,
        400,
        'ID de bicicletero inválido. Debe ser un número.'
      );
    }

    const bikerackIdNum = parseInt(bikerackId);
    const bikerackDetail = await getBikerackDetail(bikerackIdNum);

    return handleSuccess(
      res,
      200,
      'Espacios del bicicletero obtenidos exitosamente!',
      bikerackDetail
    );
  } catch (error) {
    console.error(
      `[BikerackDetail Error] ID ${req.params.bikerackId}:`,
      error.message
    );

    if (error.message.includes('no encontrado')) {
      return handleErrorClient(res, 404, 'El bicicletero solicitado no existe');
    }

    return handleErrorServer(
      res,
      500,
      'Error interno al obtener el detalle del bicicletero'
    );
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////

//* LISTAR TODOS LOS BICICLETEROS - FORMATO CORRECTO PARA FRONTEND
export async function listBikeracks(req, res) {
  try {
    console.log('🟢 [listBikeracks] Iniciando...');
    
    const racks = await bikerackRepository.find({
      relations: ['spaces'],
      order: {
        id: 'ASC'
      }
    });

    console.log(`🟢 [listBikeracks] ${racks.length} bicicleteros encontrados en BD`);

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
          relations: ['guard', 'guard.user'],
        });

        return {
          id: rack.id,
          name: rack.name,
          capacity: rack.capacity,
          location: rack.location || rack.ubicacion || 'Sin ubicación',
          usedCapacity: used,
          availableCapacity: rack.capacity - used,
          occupancyRate: ((used / rack.capacity) * 100).toFixed(2) + '%',
          activeGuards: activeAssignments.map((assignment) => ({
            id: assignment.guard.id,
            name: `${assignment.guard.user.names} ${assignment.guard.user.lastName}`,
            email: assignment.guard.user.email,
          })),
          createdAt: rack.created_at,
          updatedAt: rack.updated_at,
        };
      })
    );

    console.log('🟢 [listBikeracks] Datos procesados:', racksWithOccupancy[0]);
    console.log('🟢 [listBikeracks] Enviando respuesta...');

    // IMPORTANTE: Usar el formato que espera handleSuccess
    return res.status(200).json({
      success: true,
      message: 'Bicicleteros obtenidos exitosamente',
      count: racksWithOccupancy.length,
      data: racksWithOccupancy
    });

  } catch (error) {
    console.error('❌ [listBikeracks] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener bicicleteros',
      data: []
    });
  }
}

//! OBTENER GUARDIAS DE UN BICICLETERO
export async function getBikerackGuards(req, res) {
  try {
    const { bikerackId } = req.params;

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
      name: `${assignment.guard.user.names} ${assignment.guard.user.lastName}`,
      email: assignment.guard.user.email,
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

//! LISTAR BICICLETEROS CON GUARDIAS
export async function listBikeracksWithGuards(req, res) {
  try {
    const racks = await bikerackRepository.find({
      relations: ['guardAssignments', 'guardAssignments.guard', 'guardAssignments.guard.user'],
    });

    const racksWithGuards = racks.map((rack) => {
      const activeGuards = rack.guardAssignments.filter(
        (a) => a.status === 'activo'
      );

      return {
        id: rack.id,
        name: rack.name,
        capacity: rack.capacity,
        location: rack.location || rack.ubicacion || 'Sin ubicación',
        activeGuardsCount: activeGuards.length,
        guards: activeGuards.map((assignment) => ({
          id: assignment.guard.id,
          name: `${assignment.guard.user.names} ${assignment.guard.user.lastName}`,
          phone: assignment.guard.phone,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      count: racksWithGuards.length,
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

//* GUARDAR BICICLETA EN BICICLETERO
export async function storeBicycleInBikerack(req, res) {
  try {
    const { bikerackId, bicycleId, userId, spaceId } = req.body;

    // 1. Ejecutar tu lógica interna original
    const result = await storeBicycleInternal(bikerackId, bicycleId, userId);

    // 2. Registro en historial
    try {
      // Importante: Guardamos el guardProfile aquí ADENTRO donde 'req' sí existe
      const guardProfile = await AppDataSource.getRepository("Guard").findOne({ 
          where: { user: { id: req.user.id } } 
      });

      await historyService.logEvent({
        historyType: HISTORY_TYPES.BICYCLE_REGISTER,
        description: `Bicicleta ingresada al bicicletero`,
        userId: userId,
        bicycleId: bicycleId,
        bikerackId: bikerackId,
        spaceId: spaceId || null,
        guardId: guardProfile ? guardProfile.id : null, 
        details: { method: 'manual_store' }
      });
    } catch (hError) {
      console.error('Error en log historial:', hError.message);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.bicycle
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

//* REMOVER BICICLETA DEL BICICLETERO
export async function removeBicycleFromBikerack(req, res) {
  try {
    const { bicycleId, userId, bikerackId } = req.body; 

    if (!bicycleId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren bicycleId y userId'
      });
    }

    const result = await removeBicycleInternal(bicycleId, userId);

    // --- NUEVO: REGISTRO EN EL HISTORIAL ---
    try {
      await historyService.logEvent({
        historyType: HISTORY_TYPES.BICYCLE_REMOVE,
        description: `Bicicleta retirada del bicicletero`,
        userId: userId,
        bicycleId: bicycleId,
        bikerackId: bikerackId || null, 
        guardId: req.user?.id || null,
        details: { method: 'manual_remove' }
      });
    } catch (hError) {
      console.error('Error silencioso al registrar historial:', hError);
    }
    // ---------------------------------------

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.bicycle
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Funciones internas auxiliares
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
    return res.status(200).json({
      success: true,
      message: 'Reporte semanal generado exitosamente',
      data: report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function generateWeeklyReportData() {
  // Tu lógica de reporte aquí
  return {};
}