// backend/src/controllers/dashboard.controller.js
import { AppDataSource } from '../config/configDb.js';

/**
 * Obtiene todos los datos del dashboard desde la base de datos real
 */
export const getDashboardSummary = async (req, res) => {
  try {
    console.log('📊 [Dashboard] Obteniendo datos reales de la base de datos...');

    // ========================================
    // 1. MÉTRICAS GENERALES
    // ========================================
    const spaceLogsRepo = AppDataSource.getRepository('SpaceLog');
    const incidencesRepo = AppDataSource.getRepository('Incidence');

    // Ingresos hoy (checkins del día actual)
    const ingresosHoy = await spaceLogsRepo
      .createQueryBuilder('log')
      .where('DATE(log.actualCheckin) = CURRENT_DATE')
      .andWhere('log.action = :action', { action: 'checkin' })
      .getCount();

    // Salidas hoy (checkouts del día actual)
    const salidasHoy = await spaceLogsRepo
      .createQueryBuilder('log')
      .where('DATE(log.actualCheckout) = CURRENT_DATE')
      .andWhere('log.action = :action', { action: 'checkout' })
      .getCount();

    // Activos (espacios ocupados actualmente - checkin sin checkout)
    const activos = await spaceLogsRepo
      .createQueryBuilder('log')
      .where('log.actualCheckin IS NOT NULL')
      .andWhere('log.actualCheckout IS NULL')
      .getCount();

    // Inconsistencias (infracciones activas - tiempo excedido)
    const inconsistencias = await spaceLogsRepo
      .createQueryBuilder('log')
      .where('log.actualCheckout IS NULL') // Aún no ha salido
      .andWhere('log.infractionStart IS NOT NULL') // Ya empezó la infracción
      .andWhere('log.infractionStart < NOW()') // La fecha de infracción ya pasó
      .getCount();

    // Total de incidencias
    const totalIncidencias = await incidencesRepo.count();

    const metrics = {
      inconsistencies: inconsistencias,
      totalIncidents: totalIncidencias,
      summaryToday: {
        ingresos: ingresosHoy,
        salidas: salidasHoy,
        activos: activos,
      }
    };

    console.log('✅ Métricas obtenidas:', metrics);

    // ========================================
    // 2. CAPACIDAD DE BICICLETEROS
    // ========================================
    const bikeracksRepo = AppDataSource.getRepository('Bikerack');
    const spacesRepo = AppDataSource.getRepository('Space');

    const bikeracks = await bikeracksRepo.find();
    const capacity = [];

    for (const bikerack of bikeracks) {
      // Total de espacios del bicicletero
      const total = await spacesRepo.count({
        where: { bikerack: { id: bikerack.id } }
      });

      // Espacios ocupados (status = 'Ocupado' o 'Tiempo Excedido')
      const ocupado = await spacesRepo.count({
        where: [
          { bikerack: { id: bikerack.id }, status: 'Ocupado' },
          { bikerack: { id: bikerack.id }, status: 'Tiempo Excedido' }
        ]
      });

      const porcentaje = total > 0 ? Math.round((ocupado / total) * 100) : 0;

      capacity.push({
        id: bikerack.id,
        name: bikerack.name,
        ocupado: ocupado,
        total: total,
        porcentaje: porcentaje
      });
    }

    console.log('✅ Capacidad obtenida:', capacity.length, 'bicicleteros');

    // ========================================
    // 3. GUARDIAS POR ZONA
    // ========================================
    const guardsRepo = AppDataSource.getRepository('Guard');
    const assignmentsRepo = AppDataSource.getRepository('GuardAssignment');

    const guards = [];

    for (const bikerack of bikeracks) {
      // Obtener asignaciones activas para este bicicletero
      const assignments = await assignmentsRepo
        .createQueryBuilder('assignment')
        .leftJoinAndSelect('assignment.guard', 'guard')
        .leftJoinAndSelect('guard.user', 'user')
        .where('assignment.bikerackId = :bikerackId', { bikerackId: bikerack.id })
        .andWhere('assignment.status = :status', { status: 'activo' })
        .andWhere('(assignment.effectiveUntil IS NULL OR assignment.effectiveUntil >= CURRENT_DATE)')
        .getMany();

      const guardNames = assignments
        .filter(a => a.guard && a.guard.user)
        .map(a => `${a.guard.user.names} ${a.guard.user.lastName}`);

      // Eliminar duplicados
      const uniqueGuards = [...new Set(guardNames)];

      guards.push({
        bikerackId: bikerack.id,
        bikerackName: bikerack.name,
        guards: uniqueGuards
      });
    }

    console.log('✅ Guardias obtenidos:', guards.length, 'zonas');

    // ========================================
    // 4. ACTIVIDAD RECIENTE (últimas 15 horas con datos)
    // ========================================
    const activityQuery = await spaceLogsRepo
      .createQueryBuilder('log')
      .select("TO_CHAR(log.actualCheckin, 'HH24:00')", 'hora')
      .addSelect('COUNT(CASE WHEN log.actualCheckin IS NOT NULL THEN 1 END)', 'ingresos')
      .addSelect('COUNT(CASE WHEN log.actualCheckout IS NOT NULL THEN 1 END)', 'salidas')
      .where('log.actualCheckin >= NOW() - INTERVAL \'24 hours\'')
      .orWhere('log.actualCheckout >= NOW() - INTERVAL \'24 hours\'')
      .groupBy("TO_CHAR(log.actualCheckin, 'HH24:00')")
      .orderBy('hora', 'DESC')
      .limit(15)
      .getRawMany();

    const activity = activityQuery.map(row => ({
      hora: row.hora || '00:00',
      ingresos: parseInt(row.ingresos) || 0,
      salidas: parseInt(row.salidas) || 0
    }));

    console.log('✅ Actividad obtenida:', activity.length, 'registros de horas');

    // ========================================
    // 5. TIPOS DE INCIDENCIAS
    // ========================================
    const incidentsQuery = await incidencesRepo
      .createQueryBuilder('incidence')
      .select('incidence.incidenceType', 'tipo')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('incidence.incidenceType')
      .orderBy('cantidad', 'DESC')
      .getRawMany();

    let incidents = incidentsQuery.map(row => ({
      tipo: row.tipo,
      cantidad: parseInt(row.cantidad) || 0
    }));

    // Si no hay incidencias, mostrar tipos con cantidad 0
    if (incidents.length === 0) {
      incidents = [
        { tipo: 'Robo', cantidad: 0 },
        { tipo: 'Daño', cantidad: 0 },
        { tipo: 'Pérdida', cantidad: 0 }
      ];
    }

    console.log('✅ Incidencias obtenidas:', incidents);

    // ========================================
    // RESPUESTA FINAL
    // ========================================
    const responseData = {
      metrics,
      capacity,
      guards,
      activity,
      incidents
    };

    console.log('✅ [Dashboard] Datos obtenidos exitosamente de la base de datos');

    res.status(200).json({
      status: 'Success',
      message: 'Dashboard cargado exitosamente desde la base de datos',
      data: responseData
    });

  } catch (error) {
    console.error('❌ [Dashboard] Error al obtener datos:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({
      status: 'Error',
      message: 'Error al cargar el dashboard',
      error: error.message
    });
  }
};

/**
 * Obtiene solo las métricas generales
 */
export const getMetrics = async (req, res) => {
  try {
    const spaceLogsRepo = AppDataSource.getRepository('SpaceLog');
    const incidencesRepo = AppDataSource.getRepository('Incidence');

    const ingresosHoy = await spaceLogsRepo
      .createQueryBuilder('log')
      .where('DATE(log.actualCheckin) = CURRENT_DATE')
      .andWhere('log.action = :action', { action: 'checkin' })
      .getCount();

    const salidasHoy = await spaceLogsRepo
      .createQueryBuilder('log')
      .where('DATE(log.actualCheckout) = CURRENT_DATE')
      .andWhere('log.action = :action', { action: 'checkout' })
      .getCount();

    const activos = await spaceLogsRepo
      .createQueryBuilder('log')
      .where('log.actualCheckin IS NOT NULL')
      .andWhere('log.actualCheckout IS NULL')
      .getCount();

    const inconsistencias = await spaceLogsRepo
      .createQueryBuilder('log')
      .where('log.actualCheckout IS NULL')
      .andWhere('log.infractionStart IS NOT NULL')
      .andWhere('log.infractionStart < NOW()')
      .getCount();

    const totalIncidencias = await incidencesRepo.count();

    res.status(200).json({
      status: 'Success',
      data: {
        inconsistencies: inconsistencias,
        totalIncidents: totalIncidencias,
        summaryToday: {
          ingresos: ingresosHoy,
          salidas: salidasHoy,
          activos: activos,
        }
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo métricas:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Error al obtener métricas',
      error: error.message
    });
  }
};

/**
 * Obtiene la capacidad de los bicicleteros
 */
export const getCapacity = async (req, res) => {
  try {
    const bikeracksRepo = AppDataSource.getRepository('Bikerack');
    const spacesRepo = AppDataSource.getRepository('Space');

    const bikeracks = await bikeracksRepo.find();
    const capacity = [];

    for (const bikerack of bikeracks) {
      const total = await spacesRepo.count({
        where: { bikerack: { id: bikerack.id } }
      });

      const ocupado = await spacesRepo.count({
        where: [
          { bikerack: { id: bikerack.id }, status: 'Ocupado' },
          { bikerack: { id: bikerack.id }, status: 'Tiempo Excedido' }
        ]
      });

      const porcentaje = total > 0 ? Math.round((ocupado / total) * 100) : 0;

      capacity.push({
        id: bikerack.id,
        name: bikerack.name,
        ocupado: ocupado,
        total: total,
        porcentaje: porcentaje
      });
    }

    res.status(200).json({
      status: 'Success',
      data: capacity
    });
  } catch (error) {
    console.error('❌ Error obteniendo capacidad:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Error al obtener capacidad',
      error: error.message
    });
  }
};

/**
 * Obtiene los guardias por zona
 */
export const getGuards = async (req, res) => {
  try {
    const bikeracksRepo = AppDataSource.getRepository('Bikerack');
    const assignmentsRepo = AppDataSource.getRepository('GuardAssignment');

    const bikeracks = await bikeracksRepo.find();
    const guards = [];

    for (const bikerack of bikeracks) {
      const assignments = await assignmentsRepo
        .createQueryBuilder('assignment')
        .leftJoinAndSelect('assignment.guard', 'guard')
        .leftJoinAndSelect('guard.user', 'user')
        .where('assignment.bikerackId = :bikerackId', { bikerackId: bikerack.id })
        .andWhere('assignment.status = :status', { status: 'activo' })
        .andWhere('(assignment.effectiveUntil IS NULL OR assignment.effectiveUntil >= CURRENT_DATE)')
        .getMany();

      const guardNames = assignments
        .filter(a => a.guard && a.guard.user)
        .map(a => `${a.guard.user.names} ${a.guard.user.lastName}`);

      const uniqueGuards = [...new Set(guardNames)];

      guards.push({
        bikerackId: bikerack.id,
        bikerackName: bikerack.name,
        guards: uniqueGuards
      });
    }

    res.status(200).json({
      status: 'Success',
      data: guards
    });
  } catch (error) {
    console.error('❌ Error obteniendo guardias:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Error al obtener guardias',
      error: error.message
    });
  }
};

/**
 * Obtiene la actividad reciente
 */
export const getActivity = async (req, res) => {
  try {
    const spaceLogsRepo = AppDataSource.getRepository('SpaceLog');

    const activityQuery = await spaceLogsRepo
      .createQueryBuilder('log')
      .select("TO_CHAR(log.actualCheckin, 'HH24:00')", 'hora')
      .addSelect('COUNT(CASE WHEN log.actualCheckin IS NOT NULL THEN 1 END)', 'ingresos')
      .addSelect('COUNT(CASE WHEN log.actualCheckout IS NOT NULL THEN 1 END)', 'salidas')
      .where('log.actualCheckin >= NOW() - INTERVAL \'24 hours\'')
      .orWhere('log.actualCheckout >= NOW() - INTERVAL \'24 hours\'')
      .groupBy("TO_CHAR(log.actualCheckin, 'HH24:00')")
      .orderBy('hora', 'DESC')
      .limit(15)
      .getRawMany();

    const activity = activityQuery.map(row => ({
      hora: row.hora || '00:00',
      ingresos: parseInt(row.ingresos) || 0,
      salidas: parseInt(row.salidas) || 0
    }));

    res.status(200).json({
      status: 'Success',
      data: activity
    });
  } catch (error) {
    console.error('❌ Error obteniendo actividad:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Error al obtener actividad',
      error: error.message
    });
  }
};

/**
 * Obtiene los tipos de incidencias
 */
export const getIncidents = async (req, res) => {
  try {
    const incidencesRepo = AppDataSource.getRepository('Incidence');

    const incidentsQuery = await incidencesRepo
      .createQueryBuilder('incidence')
      .select('incidence.incidenceType', 'tipo')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('incidence.incidenceType')
      .orderBy('cantidad', 'DESC')
      .getRawMany();

    let incidents = incidentsQuery.map(row => ({
      tipo: row.tipo,
      cantidad: parseInt(row.cantidad) || 0
    }));

    if (incidents.length === 0) {
      incidents = [
        { tipo: 'Robo', cantidad: 0 },
        { tipo: 'Daño', cantidad: 0 },
        { tipo: 'Pérdida', cantidad: 0 }
      ];
    }

    res.status(200).json({
      status: 'Success',
      data: incidents
    });
  } catch (error) {
    console.error('❌ Error obteniendo incidencias:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Error al obtener incidencias',
      error: error.message
    });
  }
};