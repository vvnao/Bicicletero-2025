"use strict";

import { AppDataSource } from "../config/configDb.js";
import HistoryEntity, { HISTORY_TYPES } from "../entities/HistoryEntity.js";
import { Between, LessThan } from "typeorm"; // Importamos utilidades de TypeORM

import { Not, In } from "typeorm";

class HistoryService {
  constructor() {
    this.historyRepository = AppDataSource.getRepository("History");
  }

  // ==========================================
  //  MÉTODO PRINCIPAL DE CONSULTA (CORE)
  // ==========================================
async getHistory(filters = {}) {
    const {
        page = 1,
        limit = 10,
        type,
        historyType,
        userId,
        guardId,
        bicycleId,
        reservationId,
        bikerackId,
        search,
        startDate,
        endDate,
        onlyGuards = false 
    } = filters;

    const queryBuilder = this.historyRepository
        .createQueryBuilder("history")
        .leftJoinAndSelect("history.user", "user")
        .leftJoinAndSelect("history.guard", "guard")
        .leftJoinAndSelect("history.bicycle", "bicycle")
        .leftJoinAndSelect("history.reservation", "reservation")
        .leftJoinAndSelect("history.bikerack", "bikerack");

    // --- FILTRO DE SEPARACIÓN ---
    if (onlyGuards) {
      
       queryBuilder.andWhere("guard.id IS NOT NULL");
    }

    // 1. Filtro por Tipo de Evento
    const finalType = type || historyType;
    if (finalType) {
        queryBuilder.andWhere("history.type = :type", { type: finalType });
    }

    // 2. Filtros por Entidad (IDs)
    if (userId) queryBuilder.andWhere("user.id = :userId", { userId });
    if (guardId) queryBuilder.andWhere("guard.id = :guardId", { guardId });
    if (bicycleId) queryBuilder.andWhere("bicycle.id = :bicycleId", { bicycleId });
    if (reservationId) queryBuilder.andWhere("reservation.id = :reservationId", { reservationId });
    if (bikerackId) queryBuilder.andWhere("bikerack.id = :bikerackId", { bikerackId });

    // 3. Filtro de Búsqueda (Texto)
    if (search) {
      queryBuilder.andWhere("history.description ILIKE :search", { search: `%${search}%` });
    }

    // 4. Filtro por Fechas
    if (startDate && endDate) {
      queryBuilder.andWhere("history.created_at BETWEEN :start AND :end", {
        start: new Date(startDate),
        end: new Date(endDate)
      });
    } else if (startDate) {
      queryBuilder.andWhere("history.created_at >= :start", { start: new Date(startDate) });
    }

    // 5. Paginación y Orden
    queryBuilder
      .orderBy("history.created_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  //  MÉTODOS ESPECÍFICOS (SEPARACIÓN)
  // ==========================================

  // Historial de un Usuario Específico
  async getUserHistory(userId, filters) {
    return this.getHistory({ ...filters, userId });
  }

 async getGuardsHistory(filters) {
    return this.getHistory({ ...filters, onlyGuards: true });
}

// Para el historial de UN guardia solo
async getSpecificGuardHistory(guardId, filters) {
    return this.getHistory({ ...filters, guardId }); 
}

  // Historial de una Bicicleta Específica
  async getBicycleHistory(bicycleId, filters) {
    return this.getHistory({ ...filters, bicycleId });
  }

  // Historial de un Bicicletero (Espacio) Específico
  // Si bikerackId es null, trae de todos (útil para getAllBikerackHistory)
  async getBikerackHistory(bikerackId, filters) {
    return this.getHistory({ ...filters, bikerackId });
  }

  // ==========================================
  //  ESTADÍSTICAS Y EXTRAS
  // ==========================================

  async getRecentActivity(limit = 5) {
    return await this.historyRepository.find({
      order: { created_at: "DESC" },
      take: limit,
      relations: ["user", "guard"] // Traemos relaciones básicas
    });
  }

  async getHistoryStatistics(startDate, endDate, groupBy = 'type') {
    const queryBuilder = this.historyRepository.createQueryBuilder("history");

    if (startDate && endDate) {
      queryBuilder.where("history.created_at BETWEEN :start AND :end", {
        start: new Date(startDate),
        end: new Date(endDate)
      });
    }

    // Agrupamos por tipo de evento para contar cuántos han ocurrido
    const stats = await queryBuilder
      .select("history.type", "type")
      .addSelect("COUNT(history.id)", "count")
      .groupBy("history.type")
      .getRawMany();

    return stats;
  }

  async exportHistory(filters, writableStream) {
  const batchSize = 1000;
  let page = 1;
  
  while (true) {
    filters.page = page;
    filters.limit = batchSize;
    
    const batch = await this.getHistory(filters);
    
    if (!batch.data || batch.data.length === 0) {
      break;
    }
    
    // Escribir cada registro al stream
    for (const record of batch.data) {
      writableStream.write(recordToCSV(record));
    }
    
    page++;
    
    // Esperar un poco entre batches para no sobrecargar la DB
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  writableStream.end();
}
  async cleanOldHistory(days) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const result = await this.historyRepository
      .createQueryBuilder()
      .delete()
      .from(HistoryEntity)
      .where("created_at < :dateLimit", { dateLimit })
      .execute();

    return result;
  }

  // ==========================================
  //  REGISTRO DE EVENTOS (LOGGING)
  // ==========================================

async logEvent(data) {
  try {
    // 1.  
    const {
      type,
      historyType,
      description,
      details,
     
      user, userId,
      guard, guardId,
      bicycle, bicycleId,
      reservation, reservationId,
      bikerack, bikerackId
    } = data;

    const newEntry = this.historyRepository.create({
      type: type || historyType, 
      description,
      details,
     
      user: user || (userId ? { id: userId } : null),
      guard: guard || (guardId ? { id: guardId } : null),
      bicycle: bicycle || (bicycleId ? { id: bicycleId } : null),
      reservation: reservation || (reservationId ? { id: reservationId } : null),
      bikerack: bikerack || (bikerackId ? { id: bikerackId } : null)
    });

    return await this.historyRepository.save(newEntry);
  } catch (error) {
    console.error(" Error en logEvent:", error);
    return null; 
  }
}

async logReservationCreated(reservation) {
    try {
        // Usamos el logEvent que ya tenemos configurado y que funciona
        return await this.logEvent({
            type: 'reservation_create', 
            description: `Reserva creada: Código ${reservation.reservationCode} para el espacio ${reservation.space.spaceCode}`,
            userId: reservation.user.id,
            bicycleId: reservation.bicycleId,
            bikerackId: reservation.space.bikerack.id,
            spaceId: reservation.space.id, 
            details: {
                reservationCode: reservation.reservationCode,
                expirationTime: reservation.expirationTime,
                estimatedHours: reservation.estimatedHours
            }
        });
    } catch (error) {
       
    }
}

  /* ====== WRAPPERS SEMÁNTICOS ====== */

  async logUserCheckin(user, bicycle, bikerack) {
    return this.logEvent({
      type: HISTORY_TYPES.USER_CHECKIN,
      description: `Usuario ${user.email} ingresó bicicleta`,
      user,
      bicycle,
      bikerack,
    });
  }

  async logUserCheckout(user, bicycle, bikerack) {
    return this.logEvent({
      type: HISTORY_TYPES.USER_CHECKOUT,
      description: `Usuario ${user.email} retiró bicicleta`,
      user,
      bicycle,
      bikerack,
    });
  }

  async logReservationCreate(user, reservation) {
    return this.logEvent({
      type: HISTORY_TYPES.RESERVATION_CREATE,
      description: `Reserva #${reservation.id} creada`,
      user,
      reservation,
    });
  }

  async logReservationCancel(user, reservation) {
    return this.logEvent({
      type: HISTORY_TYPES.RESERVATION_CANCEL,
      description: `Reserva #${reservation.id} cancelada`,
      user,
      reservation,
    });
  }
// ==========================================
  //  WRAPPERS PARA GUARDIAS
  // ==========================================

  // Cuando se crea un guardia (el que acabamos de arreglar)
  async logGuardCreation(adminId, guard, req) {
    return this.logEvent({
      historyType: HISTORY_TYPES.GUARD_CREATED,
      description: `Administrador creó al guardia: ${guard.user.names} ${guard.user.lastName}`,
      userId: adminId,
      guardId: guard.id,
      details: { 
        email: guard.user.email,
        guardNumber: guard.guardNumber 
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  }

  async getAdminManagementHistory(page = 1, limit = 20) {
  const managementTypes = [
        "user_registration_request", // Texto directo o HISTORY_TYPES.TU_CONSTANTE
        "user_status_change",
        "bicycle_register"           // Nota: En tu Entity pusiste register, no registration
    ];

    const [data, total] = await this.historyRepository.findAndCount({
        where: {
            type: In(managementTypes)  
        },
        relations: ["user", "guard"],
        order: { created_at: "DESC" },  
        skip: (page - 1) * limit,
        take: limit
    });

  return {
        data,
        pagination: {
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }
    };
}
async getAdminAccountHistory(page = 1, limit = 20) {
    return await this.historyRepository.find({
        where: {
            historyType: Not(In(['user_login', 'user_logout', 'session_expired']))
        },
        relations: ["user", "guard"], // Para ver quién hizo qué
        order: { createdAt: "DESC" },
        skip: (page - 1) * limit,
        take: limit
    });
}
  // Cuando se asigna un guardia a un punto/bicicletero
  async logGuardAssignment(adminId, guardId, bikerackId, req) {
    return this.logEvent({
      historyType: HISTORY_TYPES.GUARD_ASSIGNMENT,
      description: `Guardia asignado a punto de control`,
      userId: adminId,
      guardId: guardId,
      bikerackId: bikerackId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  }
  
async getBicycleOccupancyHistory(page = 1, limit = 20) {
    const occupancyTypes = [
        "user_checkin",         // Cuando entra al bicicletero
        "reservation_activate", // Cuando la reserva se vuelve activa
        "reservation_create"    // Cuando aparta el lugar
    ];

    const [data, total] = await this.historyRepository.findAndCount({
        where: {
            type: In(occupancyTypes)
        },
        relations: ["user", "bikerack", "bicycle"], 
        order: { created_at: "DESC" },
        skip: (page - 1) * limit,
        take: limit
    });

    return {
        data,
        pagination: { total, page, totalPages: Math.ceil(total / limit) }
    };
}

// ==========================================
  //  MÉTODOS ESPECÍFICOS PARA BICICLETEROS
  // ==========================================

  /**
   * Obtener historial filtrado por un bicicletero
   */
  async getBikerackHistory(bikerackId, filters = {}) {
    // Reutilizamos el método principal pasando el ID del bicicletero en los filtros
    return await this.getHistory({
      ...filters,
      bikerackId: bikerackId
    });
  }

  /**
   * Método para registrar eventos (LogEvent)
   * Este es el que usaremos en bikerack.controller.js
   */
  async logEvent(data) {
    try {
      const newRecord = this.historyRepository.create({
        type: data.historyType,
        description: data.description,
        user: data.userId ? { id: data.userId } : null,
        guard: data.guardId ? { id: data.guardId } : null,
        bicycle: data.bicycleId ? { id: data.bicycleId } : null,
        bikerack: data.bikerackId ? { id: data.bikerackId } : null,
        space: data.spaceId ? { id: data.spaceId } : null,
        details: data.details || {}
      });

      return await this.historyRepository.save(newRecord);
    } catch (error) {
      console.error("Error al guardar en historial:", error);
      // No lanzamos error para no romper la ejecución principal del controlador
      return null;
    }
  }
//BICICLETAS SPACES HISTORY
async getBikerackUsageHistory(page = 1, limit = 20) {
    const usageTypes = ['user_checkin', 'user_checkout', 'infraction'];

    const [data, total] = await this.historyRepository.findAndCount({
        where: {
            type: In(usageTypes)
        },
        relations: ["user", "bikerack", "space"], 
        order: { created_at: "DESC" },
        skip: (page - 1) * limit,
        take: limit
    });

    return {
        data: data.map(event => ({
            id: event.id,
            fecha: event.created_at,
            usuario: event.user ? `${event.user.names} ${event.user.lastName}` : 'N/A',
            bicicletero: event.bikerack ? event.bikerack.name : 'N/A',
            lugar: event.space ? event.space.spaceCode : 'N/A', 
            tipo: event.type,
            detalles: event.description
        })),
        pagination: { total, page, totalPages: Math.ceil(total / limit) }
    };
}

  // Reporte de incidentes (Robos, daños, etc.)
  async logIncident(userId, guardId, description, details, req) {
    return this.logEvent({
      historyType: HISTORY_TYPES.INCIDENT_REPORT,
      description: `INCIDENTE: ${description}`,
      userId: userId,
      guardId: guardId,
      details: details, 
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  }
}





export default new HistoryService();