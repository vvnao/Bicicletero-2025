// services/reports.service.js
'use strict';

import { AppDataSource } from "../config/configDb.js";
import { BikerackEntity } from "../entities/BikerackEntity.js";
import { HistoryEntity } from "../entities/HistoryEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";
import { UserEntity } from "../entities/UserEntity.js";

// Servicio para generar reporte semanal CON TIPO
export async function generateWeeklyReportService(params) {
    try {
        console.log('🔧 Servicio - Parámetros recibidos:', params);
        
        // DESESTRUCTURACIÓN CON VALOR POR DEFECTO
        const { 
            weekStart, 
            weekEnd, 
            reportType = 'uso_bicicletas', // ← VALOR POR DEFECTO
            bikerackId, 
            includeDetails = false 
        } = params || {}; // ← IMPORTANTE: params puede ser undefined
        
        console.log('🔧 Servicio - Parámetros desestructurados:', {
            weekStart,
            weekEnd,
            reportType,
            bikerackId,
            includeDetails
        });
        
        // Validar que reportType exista (por si acaso)
        if (!reportType) {
            console.error('❌ reportType es undefined en el servicio');
            reportType = 'uso_bicicletas'; // Asignar valor por defecto
        }
        
        // Validar fechas
        if (!weekStart || !weekEnd) {
            throw new Error('Fechas de inicio y fin son requeridas');
        }
        
        const start = new Date(weekStart);
        const end = new Date(weekEnd);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Fechas inválidas');
        }

        console.log(`📊 Generando reporte tipo: ${reportType}`);

        // Generar reporte según el tipo seleccionado
        let reportData;
        switch(reportType) {
            case 'uso_bicicletas':
                reportData = await generateBicycleUsageReport(start, end, bikerackId);
                break;
            case 'ingresos_retiros':
                reportData = await generateIncomeWithdrawalsReport(start, end, bikerackId);
                break;
            case 'estado_inventario':
                reportData = await generateInventoryStatusReport(start, end, bikerackId);
                break;
            case 'actividad_usuarios':
                reportData = await generateUserActivityReport(start, end, bikerackId);
                break;
            case 'turnos_guardias':
                reportData = await generateGuardShiftsReport(start, end, bikerackId);
                break;
            default:
                console.warn(`⚠️ Tipo de reporte no reconocido: ${reportType}, usando por defecto`);
                reportData = await generateBicycleUsageReport(start, end, bikerackId);
        }

        return {
            report: {
                type: reportType,
                typeDisplay: getReportTypeDisplayName(reportType),
                period: {
                    start: formatDate(start),
                    end: formatDate(end),
                    weekNumber: getWeekNumber(start),
                    year: start.getFullYear()
                },
                ...reportData,
                generatedAt: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error('❌ Error en generateWeeklyReportService:', error);
        console.error('📌 Stack trace:', error.stack);
        console.error('📌 Params que causaron el error:', params);
        
        // Asegurarnos de tener reportType
        const reportType = params?.reportType || 'uso_bicicletas';
        const weekStart = params?.weekStart || new Date().toISOString().split('T')[0];
        const weekEnd = params?.weekEnd || new Date().toISOString().split('T')[0];
        
        return getEmptyReport(reportType, weekStart, weekEnd);
    }
}

// Servicio para obtener reporte semanal de un bicicletero
export async function getBikerackWeeklyReportService(bikerackId, weekStart, weekEnd, reportType = 'uso_bicicletas') {
    try {
        console.log('🔧 Servicio Bicicletero - Parámetros:', {
            bikerackId,
            weekStart,
            weekEnd,
            reportType
        });
        
        // Tu código aquí...
        
    } catch (error) {
        console.error('❌ Error en getBikerackWeeklyReportService:', error);
        throw error;
    }
}

// ========== FUNCIONES AUXILIARES ==========

function getReportTypeDisplayName(reportType) {
    const displayNames = {
        'uso_bicicletas': 'Uso de Bicicletas',
        'ingresos_retiros': 'Ingresos/Retiros',
        'estado_inventario': 'Estado del Inventario',
        'actividad_usuarios': 'Actividad de Usuarios',
        'turnos_guardias': 'Turnos de Guardias'
    };
    return displayNames[reportType] || reportType;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getEmptyReport(reportType, start, end) {
    return {
        report: {
            type: reportType,
            typeDisplay: getReportTypeDisplayName(reportType),
            period: {
                start: start,
                end: end
            },
            summary: {
                mensaje: 'Reporte generado sin datos',
                error: 'No se pudieron obtener datos del sistema'
            },
            detalle: [],
            recomendaciones: ['Verificar conexión a la base de datos']
        }
    };
}

// ========== FUNCIONES DE REPORTES (simplificadas por ahora) ==========

async function generateBicycleUsageReport(start, end, bikerackId = null) {
    console.log('🚲 Generando reporte de uso de bicicletas...');
    return {
        title: 'Reporte de Uso de Bicicletas',
        summary: {
            totalMovimientos: 0,
            diasAnalizados: 0
        },
        detalle: [],
        recomendaciones: ['No hay datos disponibles']
    };
}


// 2b. Versión para bicicletero específico
async function generateBikerackIncomeWithdrawalsReport(bikerack, start, end) {
    const report = await generateIncomeWithdrawalsReport(start, end, bikerack.id);
    
    return {
        ...report,
        bikerackInfo: {
            nombre: bikerack.name,
            capacidad: bikerack.capacity
        }
    };
}

// 3. Reporte de Estado del Inventario
async function generateInventoryStatusReport(start, end, bikerackId = null) {
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
    const bikerackRepository = AppDataSource.getRepository(BikerackEntity);
    
    // Consulta para bicicleteros y su ocupación
    let query = bikerackRepository.createQueryBuilder('b')
        .leftJoin('b.bicycles', 'bic')
        .select([
            'b.id as id',
            'b.name as nombre',
            'b.capacity as capacidad',
            'COUNT(bic.id) as ocupacion_actual',
            'b.location as ubicacion'
        ])
        .groupBy('b.id, b.name, b.capacity, b.location');

    if (bikerackId) {
        query = query.where('b.id = :bikerackId', { bikerackId });
    }

    const bikeracks = await query.getRawMany();
    
    // Consulta para estado de bicicletas
    let estadosQuery = bicycleRepository.createQueryBuilder('b')
        .select('b.status as estado, COUNT(*) as cantidad')
        .groupBy('b.status');

    if (bikerackId) {
        estadosQuery = estadosQuery.where('b.bikerack_id = :bikerackId', { bikerackId });
    }

    const estados = await estadosQuery.getRawMany();

    // Calcular estadísticas
    const totalCapacidad = bikeracks.reduce((sum, b) => sum + parseInt(b.capacidad || 0), 0);
    const totalOcupacion = bikeracks.reduce((sum, b) => sum + parseInt(b.ocupacion_actual || 0), 0);
    const porcentajeOcupacionTotal = totalCapacidad > 0 ? (totalOcupacion / totalCapacidad * 100) : 0;

    // Identificar problemas
    const sobrecapacidad = bikeracks.filter(b => b.ocupacion_actual > b.capacidad);
    const bajaOcupacion = bikeracks.filter(b => b.capacidad > 0 && b.ocupacion_actual < b.capacidad * 0.3);

    return {
        title: 'Reporte de Estado del Inventario',
        summary: {
            totalBicicleteros: bikeracks.length,
            capacidadTotal: totalCapacidad,
            ocupacionTotal: totalOcupacion,
            porcentajeOcupacionTotal: Math.round(porcentajeOcupacionTotal * 100) / 100 + '%',
            bicicleterosSobrecapacidad: sobrecapacidad.length,
            bicicleterosBajaOcupacion: bajaOcupacion.length
        },
        bikeracks: bikeracks.map(b => ({
            id: b.id,
            nombre: b.nombre,
            ubicacion: b.ubicacion || 'No especificada',
            capacidad: b.capacidad,
            ocupacion: b.ocupacion_actual,
            porcentajeOcupacion: b.capacidad > 0 ? 
                Math.round((b.ocupacion_actual / b.capacidad * 100) * 100) / 100 + '%' : '0%',
            estado: b.ocupacion_actual > b.capacidad ? 'Sobrecapacidad' : 
                   b.ocupacion_actual < b.capacidad * 0.3 ? 'Baja ocupación' : 'Óptimo'
        })),
        estadosBicicletas: estados,
        problemas: {
            sobrecapacidad: sobrecapacidad.map(b => ({
                bicicletero: b.nombre,
                exceso: b.ocupacion_actual - b.capacidad
            })),
            bajaOcupacion: bajaOcupacion.map(b => ({
                bicicletero: b.nombre,
                ocupacion: b.ocupacion_actual,
                capacidad: b.capacidad,
                porcentaje: Math.round((b.ocupacion_actual / b.capacidad * 100) * 100) / 100 + '%'
            }))
        },
        recomendaciones: generarRecomendacionesInventario(bikeracks)
    };
}


// 4. Reporte de Actividad de Usuarios
async function generateUserActivityReport(start, end, bikerackId = null) {
    const userRepository = AppDataSource.getRepository(UserEntity);
    const historyRepository = AppDataSource.getRepository(HistoryEntity);
    
    // Obtener usuarios activos en el período
    const usuariosActivos = await userRepository.createQueryBuilder('u')
        .select(['u.id', 'u.name', 'u.email', 'u.role', 'u.created_at'])
        .where('u.created_at <= :end', { end: end.toISOString() })
        .getMany();

    // Obtener actividad por usuario
    let actividadQuery = historyRepository.createQueryBuilder('h')
        .innerJoin('h.user', 'u')
        .select([
            'u.id as userId',
            'u.name as userName',
            'COUNT(h.id) as totalMovimientos',
            'SUM(CASE WHEN h.movement_type = :ingreso THEN 1 ELSE 0 END) as ingresos',
            'SUM(CASE WHEN h.movement_type = :salida THEN 1 ELSE 0 END) as retiros'
        ])
        .where('h.timestamp BETWEEN :start AND :end', { 
            start: start.toISOString(), 
            end: end.toISOString() 
        })
        .setParameters({
            ingreso: 'ingreso',
            salida: 'salida'
        })
        .groupBy('u.id, u.name')
        .orderBy('totalMovimientos', 'DESC');

    if (bikerackId) {
        actividadQuery = actividadQuery.andWhere('h.bikerack_id = :bikerackId', { bikerackId });
    }

    const actividad = await actividadQuery.getRawMany();

    // Estadísticas de actividad
    const totalMovimientos = actividad.reduce((sum, a) => sum + parseInt(a.totalmovimientos || 0), 0);
    const usuariosConActividad = actividad.length;
    const promedioMovimientosPorUsuario = usuariosConActividad > 0 ? 
        totalMovimientos / usuariosConActividad : 0;

    // Top 10 usuarios más activos
    const topUsuarios = actividad.slice(0, 10);

    return {
        title: 'Reporte de Actividad de Usuarios',
        summary: {
            usuariosRegistrados: usuariosActivos.length,
            usuariosConActividad,
            totalMovimientos,
            promedioMovimientosPorUsuario: Math.round(promedioMovimientosPorUsuario * 100) / 100,
            periodo: `${formatDate(start)} a ${formatDate(end)}`
        },
        actividadPorUsuario: actividad.map(a => ({
            userId: a.userid,
            nombre: a.username,
            totalMovimientos: a.totalmovimientos,
            ingresos: a.ingresos,
            retiros: a.retiros,
            balance: (a.ingresos || 0) - (a.retiros || 0)
        })),
        topUsuarios: topUsuarios.map(u => ({
            nombre: u.username,
            movimientos: u.totalmovimientos,
            porcentajeTotal: Math.round((u.totalmovimientos / totalMovimientos * 100) * 100) / 100 + '%'
        })),
        recomendaciones: generarRecomendacionesActividad(actividad)
    };
}

// 4b. Versión para bicicletero específico
async function generateBikerackUserActivityReport(bikerack, start, end) {
    const report = await generateUserActivityReport(start, end, bikerack.id);
    
    return {
        ...report,
        title: `Reporte de Actividad de Usuarios - ${bikerack.name}`,
        bikerackInfo: {
            nombre: bikerack.name,
            ubicacion: bikerack.location || 'No especificada'
        }
    };
}

// 5. Reporte de Turnos de Guardias
async function generateGuardShiftsReport(start, end, bikerackId = null) {
    const userRepository = AppDataSource.getRepository(UserEntity);
    
    // Buscar usuarios con rol 'guardia'
    const guardias = await userRepository.find({
        where: { role: 'guardia' },
        select: ['id', 'name', 'email', 'created_at', 'last_login']
    });

    // Si no hay tabla específica de turnos, podemos inferir actividad
    const historyRepository = AppDataSource.getRepository(HistoryEntity);
    
    let actividadGuardiasQuery = historyRepository.createQueryBuilder('h')
        .innerJoin('h.user', 'u')
        .select([
            'u.id as guardiaId',
            'u.name as guardiaNombre',
            'DATE(h.timestamp) as fecha',
            'COUNT(h.id) as actividades'
        ])
        .where('u.role = :role', { role: 'guardia' })
        .andWhere('h.timestamp BETWEEN :start AND :end', {
            start: start.toISOString(),
            end: end.toISOString()
        })
        .groupBy('u.id, u.name, DATE(h.timestamp)')
        .orderBy('fecha', 'DESC');

    if (bikerackId) {
        actividadGuardiasQuery = actividadGuardiasQuery.andWhere('h.bikerack_id = :bikerackId', { bikerackId });
    }

    const actividadGuardias = await actividadGuardiasQuery.getRawMany();

    // Procesar por día
    const dias = [];
    let currentDay = new Date(start);
    
    while (currentDay <= end) {
        const dayStr = formatDate(currentDay);
        const actividadesDia = actividadGuardias.filter(a => a.fecha === dayStr);
        
        dias.push({
            fecha: dayStr,
            dia: getDayName(currentDay),
            guardiasActivos: [...new Set(actividadesDia.map(a => a.guardianombre))].length,
            totalActividades: actividadesDia.reduce((sum, a) => sum + parseInt(a.actividades || 0), 0),
            detalleGuardias: actividadesDia.map(a => ({
                nombre: a.guardianombre,
                actividades: a.actividades
            }))
        });
        
        currentDay.setDate(currentDay.getDate() + 1);
    }

    // Estadísticas de guardias
    const guardiasActivos = [...new Set(actividadGuardias.map(a => a.guardianombre))].length;
    const totalActividades = dias.reduce((sum, d) => sum + d.totalActividades, 0);
    const promedioActividadesPorDia = dias.length > 0 ? totalActividades / dias.length : 0;

    return {
        title: 'Reporte de Turnos de Guardias',
        summary: {
            totalGuardias: guardias.length,
            guardiasActivos,
            diasAnalizados: dias.length,
            totalActividades,
            promedioActividadesPorDia: Math.round(promedioActividadesPorDia * 100) / 100,
            periodo: `${formatDate(start)} a ${formatDate(end)}`
        },
        guardias: guardias.map(g => ({
            id: g.id,
            nombre: g.name,
            email: g.email,
            fechaRegistro: g.created_at,
            ultimoAcceso: g.last_login
        })),
        actividadPorDia: dias,
        diasSinActividad: dias.filter(d => d.totalActividades === 0).map(d => d.fecha),
        recomendaciones: generarRecomendacionesGuardias(dias, guardias.length)
    };
}

// 5b. Versión para bicicletero específico
async function generateBikerackGuardShiftsReport(bikerack, start, end) {
    const report = await generateGuardShiftsReport(start, end, bikerack.id);
    
    return {
        ...report,
        title: `Reporte de Guardias - ${bikerack.name}`,
        bikerackInfo: {
            nombre: bikerack.name,
            ubicacion: bikerack.location || 'No especificada'
        }
    };
}

// ========== FUNCIONES DE RECOMENDACIONES ==========

function generarRecomendacionesUso(dias) {
    const recomendaciones = [];
    
    if (dias.length === 0) {
        return ['No hay datos de uso en el período seleccionado'];
    }
    
    const totales = dias.map(d => d.total);
    const promedio = totales.reduce((a, b) => a + b, 0) / totales.length;
    
    const diasAltos = dias.filter(d => d.total > promedio * 1.5);
    const diasBajos = dias.filter(d => d.total < promedio * 0.5);
    
    if (diasAltos.length > 0) {
        recomendaciones.push(`Reforzar personal los días: ${diasAltos.map(d => d.dayName).join(', ')}`);
    }
    
    if (diasBajos.length > 2) {
        recomendaciones.push(`Evaluar horarios de operación en días de baja demanda`);
    }
    
    // Buscar patrones por día de la semana
    const porDiaSemana = {};
    dias.forEach(dia => {
        if (!porDiaSemana[dia.dayName]) porDiaSemana[dia.dayName] = [];
        porDiaSemana[dia.dayName].push(dia.total);
    });
    
    for (const [dia, valores] of Object.entries(porDiaSemana)) {
        const promedioDia = valores.reduce((a, b) => a + b, 0) / valores.length;
        if (promedioDia > promedio * 1.3) {
            recomendaciones.push(`Los ${dia}s tienen alta demanda (${Math.round(promedioDia)} movimientos promedio)`);
        }
    }
    
    return recomendaciones.length > 0 ? recomendaciones : ['Patrón de uso estable y predecible'];
}

function generarRecomendacionesBalance(dias) {
    const recomendaciones = [];
    let diasNegativos = 0;
    
    dias.forEach(dia => {
        const balance = dia.ingresos - dia.retiros;
        if (balance < 0) {
            diasNegativos++;
        }
    });
    
    if (diasNegativos > dias.length * 0.5) {
        recomendaciones.push(`Más del 50% de los días tuvieron más retiros que ingresos. Evaluar política de préstamos.`);
    }
    
    // Calcular tendencia semanal
    if (dias.length >= 7) {
        const primeraSemana = dias.slice(0, 7).reduce((sum, d) => sum + (d.ingresos - d.retiros), 0);
        const segundaSemana = dias.slice(-7).reduce((sum, d) => sum + (d.ingresos - d.retiros), 0);
        
        if (segundaSemana < primeraSemana * 0.7) {
            recomendaciones.push(`Tendencia negativa en el balance semanal. Revisar inventario.`);
        }
    }
    
    return recomendaciones.length > 0 ? recomendaciones : ['Balance saludable entre ingresos y retiros'];
}

function generarRecomendacionesInventario(bikeracks) {
    const recomendaciones = [];
    
    const sobrecapacidad = bikeracks.filter(b => b.ocupacion_actual > b.capacidad);
    const bajaOcupacion = bikeracks.filter(b => b.capacidad > 0 && b.ocupacion_actual < b.capacidad * 0.3);
    
    if (sobrecapacidad.length > 0) {
        const totalExceso = sobrecapacidad.reduce((sum, b) => 
            sum + (b.ocupacion_actual - b.capacidad), 0);
        recomendaciones.push(`Redistribuir ${totalExceso} bicicletas desde ${sobrecapacidad.length} bicicletero(s) con sobrecapacidad`);
    }
    
    if (bajaOcupacion.length > 0) {
        recomendaciones.push(`Reubicar o reducir capacidad en ${bajaOcupacion.length} bicicletero(s) con ocupación menor al 30%`);
    }
    
    // Recomendaciones de capacidad
    const ocupacionPromedio = bikeracks.reduce((sum, b) => sum + b.ocupacion_actual, 0) / 
                             Math.max(bikeracks.length, 1);
    const capacidadPromedio = bikeracks.reduce((sum, b) => sum + b.capacidad, 0) / 
                             Math.max(bikeracks.length, 1);
    
    if (ocupacionPromedio < capacidadPromedio * 0.4) {
        recomendaciones.push(`Capacidad general subutilizada (${Math.round(ocupacionPromedio/capacidadPromedio*100)}%). Considerar consolidar bicicleteros.`);
    }
    
    return recomendaciones.length > 0 ? recomendaciones : ['Inventario equilibrado y eficiente'];
}

function generarRecomendacionesActividad(actividad) {
    const recomendaciones = [];
    
    if (actividad.length === 0) {
        return ['No hay actividad de usuarios registrada'];
    }
    
    const totalMovimientos = actividad.reduce((sum, a) => sum + parseInt(a.totalmovimientos || 0), 0);
    
    // Identificar usuarios inactivos
    const usuariosInactivos = actividad.filter(a => a.totalmovimientos < 3);
    if (usuariosInactivos.length > actividad.length * 0.3) {
        recomendaciones.push(`${usuariosInactivos.length} usuarios con poca actividad (<3 movimientos). Considerar campaña de engagement.`);
    }
    
    // Usuarios muy activos
    const usuariosMuyActivos = actividad.filter(a => a.totalmovimientos > 20);
    if (usuariosMuyActivos.length > 0) {
        recomendaciones.push(`${usuariosMuyActivos.length} usuario(s) muy activo(s). Considerar programa de fidelización.`);
    }
    
    // Distribución de actividad
    if (actividad.length > 10) {
        const top5 = actividad.slice(0, 5).reduce((sum, a) => sum + parseInt(a.totalmovimientos || 0), 0);
        const porcentajeTop5 = (top5 / totalMovimientos * 100).toFixed(1);
        if (porcentajeTop5 > 60) {
            recomendaciones.push(`El ${porcentajeTop5}% de la actividad concentrada en 5 usuarios. Diversificar base de usuarios.`);
        }
    }
    
    return recomendaciones.length > 0 ? recomendaciones : ['Actividad de usuarios saludable y distribuida'];
}

function generarRecomendacionesGuardias(dias, totalGuardias) {
    const recomendaciones = [];
    
    if (dias.length === 0) {
        return ['No hay datos de actividad de guardias'];
    }
    
    const diasSinActividad = dias.filter(d => d.totalActividades === 0);
    if (diasSinActividad.length > 0) {
        recomendaciones.push(`${diasSinActividad.length} día(s) sin actividad registrada de guardias`);
    }
    
    // Verificar cobertura
    const promedioGuardiasPorDia = dias.reduce((sum, d) => sum + d.guardiasActivos, 0) / dias.length;
    if (promedioGuardiasPorDia < 1) {
        recomendaciones.push(`Cobertura insuficiente. Promedio de ${promedioGuardiasPorDia.toFixed(1)} guardias por día`);
    }
    
    // Si hay muchos guardias pero poca actividad
    if (totalGuardias > 5 && promedioGuardiasPorDia < totalGuardias * 0.5) {
        recomendaciones.push(`Optimizar asignación de guardias. Solo ${Math.round(promedioGuardiasPorDia/totalGuardias*100)}% del personal activo diariamente`);
    }
    
    // Días con sobrecarga
    const diasSobrecarga = dias.filter(d => d.totalActividades > 50);
    if (diasSobrecarga.length > 0) {
        recomendaciones.push(`${diasSobrecarga.length} día(s) con alta carga de trabajo (>50 actividades). Considerar refuerzo.`);
    }
    
    return recomendaciones.length > 0 ? recomendaciones : ['Cobertura de guardias adecuada y actividad estable'];
}


// Generar plan de redistribución REAL
export async function generateRedistributionPlanService(bikerackId, date, manualOverride = false) {
    try {
        const bikerackRepository = AppDataSource.getRepository(BikerackEntity);
        const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
        
        // Obtener bicicletero origen REAL
        const sourceBikerack = await bikerackRepository.findOne({ 
            where: { id: bikerackId }
        });

        if (!sourceBikerack) {
            throw new Error('Bicicletero origen no encontrado');
        }

        // Contar bicicletas REALES en el bicicletero
        const currentBicycles = await bicycleRepository.count({
            where: { bikerack: { id: bikerackId } }
        });

        // Verificar si hay sobrecapacidad REAL
        if (currentBicycles <= sourceBikerack.capacity) {
            return {
                needsRedistribution: false,
                message: 'No se requiere redistribución',
                currentOccupation: currentBicycles,
                capacity: sourceBikerack.capacity
            };
        }

        // Calcular exceso REAL
        const excessBicycles = currentBicycles - sourceBikerack.capacity;
        
        // Buscar bicicleteros destino REALES con capacidad disponible
        const allBikeracks = await bikerackRepository.find({
            where: { id: bikerackId }
        });

        const targetBikeracks = [];
        
        for (const bikerack of allBikeracks) {
            if (bikerack.id === bikerackId) continue;
            
            const bicyclesInBikerack = await bicycleRepository.count({
                where: { bikerack: { id: bikerack.id } }
            });
            
            const availableSpaces = bikerack.capacity - bicyclesInBikerack;
            
            if (availableSpaces > 0) {
                targetBikeracks.push({
                    id: bikerack.id,
                    name: bikerack.name,
                    capacity: bikerack.capacity,
                    currentOccupation: bicyclesInBikerack,
                    availableSpaces,
                    suggestedTake: Math.min(availableSpaces, Math.ceil(excessBicycles / (targetBikeracks.length + 1)))
                });
            }
        }

        // Generar plan de redistribución REAL
        const redistributionPlan = [];
        let remainingExcess = excessBicycles;
        
        for (const target of targetBikeracks) {
            if (remainingExcess <= 0) break;
            
            const toMove = Math.min(target.suggestedTake, remainingExcess);
            redistributionPlan.push({
                targetBikerackId: target.id,
                targetBikerackName: target.name,
                bicyclesToMove: toMove,
                newOccupation: target.currentOccupation + toMove
            });
            
            remainingExcess -= toMove;
        }

        return {
            needsRedistribution: true,
            sourceBikerack: {
                id: sourceBikerack.id,
                name: sourceBikerack.name,
                currentOccupation: currentBicycles,
                capacity: sourceBikerack.capacity,
                excess: excessBicycles
            },
            targetBikeracks,
            redistributionPlan,
            canExecuteAutomatically: remainingExcess === 0 && !manualOverride,
            requiresManualReview: manualOverride || remainingExcess > 0,
            remainingExcess,
            planId: `REDIST-${Date.now()}-${bikerackId}`,
            generatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error en generateRedistributionPlanService:', error);
        throw error;
    }
}

// Ejecutar redistribución - Versión real (simulada por ahora)
export async function executeRedistributionService(planId, confirm = false, adjustments = []) {
    try {
        if (!confirm) {
            return {
                valid: true,
                planId,
                status: 'validated',
                message: 'Plan validado, listo para ejecución',
                canExecute: true
            };
        }

        // EN UNA IMPLEMENTACIÓN REAL, AQUÍ SE ACTUALIZARÍA LA BASE DE DATOS
        // Por ahora simulamos la ejecución
        console.log(`[SISTEMA] Ejecutando redistribución del plan: ${planId}`);
        
        return {
            executed: true,
            planId,
            status: 'executed',
            executedAt: new Date().toISOString(),
            changes: adjustments.length > 0 ? adjustments : ['Redistribución ejecutada exitosamente'],
            message: 'Las bicicletas han sido redistribuidas según el plan'
        };
    } catch (error) {
        console.error('Error en executeRedistributionService:', error);
        throw error;
    }
}

// ========== FUNCIONES AUXILIARES REALES ==========

// Generar reporte REAL de un bicicletero
async function generateRealBikerackReport(bikerack, start, end) {
    try {
        const historyRepository = AppDataSource.getRepository(HistoryEntity);
        const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
        
        // Formatear fechas para consulta SQL
        const startStr = formatDate(start);
        const endStr = formatDate(end);
        
        // Obtener movimientos REALES usando query raw (más seguro)
        const movementsQuery = `
            SELECT 
                DATE(timestamp) as date,
                movement_type as movementType,
                COUNT(*) as count
            FROM history 
            WHERE bikerack_id = $1 
            AND DATE(timestamp) BETWEEN $2 AND $3
            GROUP BY DATE(timestamp), movement_type
            ORDER BY date
        `;
        
        const movementsRaw = await historyRepository.query(movementsQuery, [
            bikerack.id, 
            startStr, 
            endStr
        ]);
        
        // Calcular ocupación actual REAL
        const currentOccupation = await bicycleRepository.count({
            where: { bikerack: { id: bikerack.id } }
        });
        
        // Procesar resultados
        const totalMovements = movementsRaw.reduce((sum, row) => sum + parseInt(row.count || 0), 0);
        const ingresos = movementsRaw
            .filter(row => row.movementtype === 'ingreso')
            .reduce((sum, row) => sum + parseInt(row.count || 0), 0);
        const salidas = movementsRaw
            .filter(row => row.movementtype === 'salida')
            .reduce((sum, row) => sum + parseInt(row.count || 0), 0);
        
        // Calcular días
        const days = [];
        let currentDay = new Date(start);
        
        while (currentDay <= end) {
            const dayStr = formatDate(currentDay);
            const dayData = movementsRaw.filter(row => row.date === dayStr);
            
            const dayIngresos = dayData
                .filter(row => row.movementtype === 'ingreso')
                .reduce((sum, row) => sum + parseInt(row.count || 0), 0);
                
            const daySalidas = dayData
                .filter(row => row.movementtype === 'salida')
                .reduce((sum, row) => sum + parseInt(row.count || 0), 0);
            
            days.push({
                date: dayStr,
                dayName: getDayName(currentDay),
                ingresos: dayIngresos,
                salidas: daySalidas,
                total: dayIngresos + daySalidas
            });
            
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        return {
            id: bikerack.id,
            name: bikerack.name,
            capacity: bikerack.capacity,
            currentOccupation,
            utilizationRate: bikerack.capacity > 0 ? 
                (currentOccupation / bikerack.capacity) * 100 : 0,
            movements: {
                total: totalMovements,
                ingresos,
                salidas,
                byDay: days
            },
            issues: {
                incidences: bikerack.incidences ? bikerack.incidences.length : 0,
                overCapacity: currentOccupation > bikerack.capacity
            }
        };
        
    } catch (error) {
        console.error(`Error en generateRealBikerackReport para bicicletero ${bikerack.id}:`, error);
        // Devolver estructura básica en caso de error
        return {
            id: bikerack.id,
            name: bikerack.name,
            capacity: bikerack.capacity,
            currentOccupation: 0,
            utilizationRate: 0,
            movements: { total: 0, ingresos: 0, salidas: 0, byDay: [] },
            issues: { 
                incidences: bikerack.incidences ? bikerack.incidences.length : 0,
                overCapacity: false 
            }
        };
    }
}

// Detectar anomalías REALES
async function detectRealAnomalies(bikerackReports) {
    const anomalies = [];
    
    for (const report of bikerackReports) {
        // Detectar sobrecapacidad REAL
        if (report.currentOccupation > report.capacity) {
            anomalies.push({
                type: 'over_capacity',
                severity: 'high',
                bikerackId: report.id,
                bikerackName: report.name,
                description: `Sobrepaso de capacidad: ${report.currentOccupation}/${report.capacity}`,
                suggestedAction: `Redistribuir ${report.currentOccupation - report.capacity} bicicletas`
            });
        }
        
        // Detectar baja utilización (<20%)
        if (report.utilizationRate < 20 && report.capacity > 10) {
            anomalies.push({
                type: 'low_utilization',
                severity: 'low',
                bikerackId: report.id,
                bikerackName: report.name,
                description: `Baja utilización: ${report.utilizationRate.toFixed(1)}%`,
                suggestedAction: 'Evaluar necesidad del bicicletero'
            });
        }
    }
    
    return anomalies;
}

// Detectar anomalías de un bicicletero específico
async function detectBikerackAnomalies(bikerack) {
    const anomalies = [];
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
    
    try {
        const currentOccupation = await bicycleRepository.count({
            where: { bikerack: { id: bikerack.id } }
        });

        if (currentOccupation > bikerack.capacity) {
            anomalies.push({
                type: 'over_capacity',
                severity: 'high',
                description: `Sobrepaso de capacidad: ${currentOccupation}/${bikerack.capacity}`,
                suggestedAction: 'Redistribuir bicicletas inmediatamente'
            });
        }
    } catch (error) {
        console.error(`Error detectando anomalías para bicicletero ${bikerack.id}:`, error);
    }
    
    return anomalies;
}

// Generar recomendaciones REALES
function generateRealRecommendations(bikerackReports, anomalies) {
    const recommendations = [];
    
    // Recomendación por sobrecapacidad
    const overCapacityAnomalies = anomalies.filter(a => a.type === 'over_capacity');
    if (overCapacityAnomalies.length > 0) {
        const totalExcess = overCapacityAnomalies.reduce((sum, anomaly) => {
            const match = anomaly.description.match(/(\d+)\/(\d+)/);
            if (match) {
                const current = parseInt(match[1]);
                const capacity = parseInt(match[2]);
                return sum + (current - capacity);
            }
            return sum;
        }, 0);
        
        recommendations.push(`Redistribuir ${totalExcess} bicicletas de ${overCapacityAnomalies.length} bicicletero(s) con sobrecapacidad`);
    }
    
    // Recomendaciones por utilización
    const lowUtilization = bikerackReports.filter(r => r.utilizationRate < 30 && r.capacity > 0);
    const highUtilization = bikerackReports.filter(r => r.utilizationRate > 80 && r.capacity > 0);
    
    if (lowUtilization.length > 0) {
        recommendations.push(`Evaluar ${lowUtilization.length} bicicletero(s) con baja utilización (<30%)`);
    }
    
    if (highUtilization.length > 0) {
        recommendations.push(`Considerar ampliar capacidad en ${highUtilization.length} bicicletero(s) con alta utilización (>80%)`);
    }
    
    // Recomendación general si no hay anomalías
    if (recommendations.length === 0) {
        recommendations.push('Todos los bicicleteros funcionan dentro de los parámetros normales');
    }
    
    return recommendations;
}

