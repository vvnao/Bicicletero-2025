// controllers/guardAssignment.controller.js - VERSIÓN CORREGIDA
import { AppDataSource } from '../config/configDb.js'; // ← CAMBIO IMPORTANTE
import { GuardAssignmentEntity } from '../entities/GuardAssignmentEntity.js';
import { GuardEntity } from '../entities/GuardEntity.js';
import { BicicleteroEntity } from '../entities/BicicleteroEntity.js';
import { validateCreateAssignment } from '../validations/guardAssignment.validation.js';
import HistoryService from '../services/history.service.js';
import { Not } from "typeorm";


export class GuardAssignmentController {
      constructor() {
        this.historyService = HistoryService; 
    }
    // Obtener repositorios
    get assignmentRepository() {
        return AppDataSource.getRepository(GuardAssignmentEntity);
    }

    get guardRepository() {
        return AppDataSource.getRepository(GuardEntity);
    }

    get bikerackRepository() {
        return AppDataSource.getRepository(BicicleteroEntity);
    }

   async create(req, res) {
           try {
            console.log('🔵 [CREATE ASSIGNMENT] Iniciando...');
            
            const { error, value } = validateCreateAssignment(req.body);
            if (error) {
                console.log('❌ Error de validación:', error.details);
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.details.map(detail => detail.message)
                });
            }

            const { guardId, bikerackId, dayOfWeek, startTime, endTime } = value;

        // 2. Verificar que el guardia existe
        console.log(`🔍 Buscando guardia con ID: ${guardId}`);
        
        // DIAGNÓSTICO: Buscar sin filtro de disponibilidad primero
        const guardWithoutFilter = await this.guardRepository.findOne({
            where: { id: guardId },
            relations: ['user']
        });
        
        console.log('🔍 Guardia encontrado (sin filtro):', guardWithoutFilter);
        
        if (!guardWithoutFilter) {
            console.log('❌ Guardia NO EXISTE en la base de datos');
            return res.status(404).json({
                success: false,
                message: `Guardia con ID ${guardId} no existe en la base de datos`
            });
        }
        
        console.log('✅ Guardia existe:', {
            id: guardWithoutFilter.id,
            userId: guardWithoutFilter.userId,
            isAvailable: guardWithoutFilter.isAvailable,
            userName: guardWithoutFilter.user ? 
                `${guardWithoutFilter.user.names} ${guardWithoutFilter.user.lastName}` : 
                'N/A'
        });
        
        // Ahora verificar disponibilidad
        if (!guardWithoutFilter.isAvailable) {
            console.log('⚠️ Guardia no está disponible (isAvailable: false)');
            return res.status(400).json({
                success: false,
                message: `El guardia ${guardWithoutFilter.user?.names || 'ID ' + guardId} no está disponible actualmente`
            });
        }
        
        const guard = guardWithoutFilter;

        // 3. Verificar que el bicicletero existe
        console.log(`🔍 Buscando bicicletero con ID: ${bikerackId}`);
        const bikerack = await this.bikerackRepository.findOne({
            where: { id: bikerackId }
        });

        if (!bikerack) {
            console.log('❌ Bicicletero NO EXISTE');
            return res.status(404).json({
                success: false,
                message: `Bicicletero con ID ${bikerackId} no encontrado`
            });
        }
        
        console.log('✅ Bicicletero encontrado:', {
            id: bikerack.id,
            name: bikerack.name,
            capacity: bikerack.capacity
        });

        // 4. Convertir dayOfWeek a número si es string
        const dayNumber = typeof dayOfWeek === 'string' 
            ? this.parseDayToNumber(dayOfWeek)
            : parseInt(dayOfWeek);
            
        console.log(`📅 Día procesado: ${dayOfWeek} → ${dayNumber} (${this.getDayName(dayNumber)})`);

        // 5. Validar que el día sea válido (0-6)
        if (dayNumber < 0 || dayNumber > 6) {
            return res.status(400).json({
                success: false,
                message: 'Día de la semana inválido. Use 0-6 (0=domingo) o nombre del día'
            });
        }

        // 6. **VALIDACIONES DE CONFLICTO**
        console.log('🔍 Verificando conflictos...');
        
        // A) Mismo guardia + mismo bicicletero + mismo horario
        const existingSameGuardBikerack = await this.assignmentRepository.findOne({
            where: {
                guardId,
                bikerackId,
                dayOfWeek: dayNumber,
                startTime,
                endTime,
                status: 'activo'
            }
        });

        if (existingSameGuardBikerack) {
            console.log('❌ Conflicto: Mismo guardia + mismo bicicletero + mismo horario');
            return res.status(400).json({
                success: false,
                message: 'Este guardia ya está asignado a este bicicletero en este horario'
            });
        }

        // B) Mismo bicicletero + OTRO guardia + mismo horario
        const existingSameBikerack = await this.assignmentRepository.findOne({
            where: {
                bikerackId,
                dayOfWeek: dayNumber,
                startTime,
                endTime,
                status: 'activo',
                guardId: Not(guardId)
            }
        });

        if (existingSameBikerack) {
            console.log('❌ Conflicto: Bicicletero ocupado por otro guardia');
            return res.status(400).json({
                success: false,
                message: 'Este bicicletero ya tiene un guardia asignado en este horario'
            });
        }

        // C) Mismo guardia en otro bicicletero al mismo tiempo
        const existingSameGuardOtherBikerack = await this.assignmentRepository.findOne({
            where: {
                guardId,
                dayOfWeek: dayNumber,
                startTime,
                endTime,
                status: 'activo',
                bikerackId: Not(bikerackId)
            }
        });

        if (existingSameGuardOtherBikerack) {
            console.log('❌ Conflicto: Guardia asignado a otro bicicletero en ese horario');
            return res.status(400).json({
                success: false,
                message: 'Este guardia ya está asignado a otro bicicletero en este horario'
            });
        }
        
        console.log('✅ Sin conflictos de horario');

        // 7. Calcular duración en horas
        const duration = this.calculateDuration(startTime, endTime);
        console.log(`⏰ Duración de asignación: ${duration} horas`);

        // 8. Verificar límite de horas semanales
        const weeklyHours = await this.getGuardWeeklyHours(guardId, dayNumber);
        const maxHours = guard.maxHoursPerWeek || 40;
        
        console.log(`📊 Horas semanales actuales: ${weeklyHours}h / ${maxHours}h`);
        console.log(`📊 Después de esta asignación: ${weeklyHours + duration}h / ${maxHours}h`);
        
        if (weeklyHours + duration > maxHours) {
            console.log('❌ Excede límite de horas semanales');
            return res.status(400).json({
                success: false,
                message: `El guardia excede su límite de horas semanales. Actual: ${weeklyHours}h, Límite: ${maxHours}h`
            });
        }

       // 9. Crear la asignación
    console.log('💾 Creando asignación...');
    const newAssignment = this.assignmentRepository.create({
        guardId,
        bikerackId,
        dayOfWeek: dayNumber,
        startTime,
        endTime,
        schedule: `${startTime}-${endTime}`,
        workDays: this.getDayName(dayNumber),
        maxHoursPerWeek: maxHours,
        effectiveFrom: value.effectiveFrom || new Date(),
        effectiveUntil: value.effectiveUntil || null,
        status: 'activo',
        // CORRECCIÓN: Usamos el ID del usuario logueado o el ID 1 como respaldo
        assignedBy: req.user?.id || 1 
    });

    await this.assignmentRepository.save(newAssignment);
    console.log('✅ Asignación guardada con ID:', newAssignment.id);

    // Registro en el Historial
    try {
        await this.historyService.logEvent({
            historyType: 'guard_assignment',
            description: `Guardia asignado a bicicletero ${bikerack.name}`,
            assignmentId: newAssignment.id,
            guardId: newAssignment.guardId,
            bikerackId: newAssignment.bikerackId,
            userId: req.user?.id || 1, // Quien realizó la acción
            details: {
                schedule: `${newAssignment.startTime} - ${newAssignment.endTime}`,
                day: this.getDayName(dayNumber)
            }
        });
    } catch (hError) {
        console.error('⚠️ Error al registrar historial (no crítico):', hError.message);
    }
        // 10. Obtener con relaciones
        const assignmentWithRelations = await this.assignmentRepository.findOne({
            where: { id: newAssignment.id },
            relations: ['guard', 'guard.user', 'bikerack', 'assignedByUser']
        });

        console.log('Asignación creada exitosamente');
        
        res.status(201).json({
            success: true,
            message: 'Asignación creada exitosamente',
            data: assignmentWithRelations
        });

    } catch (error) {
        console.error(' Error creating assignment:', error);
        console.error(' Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

    // Métodos auxiliares
    parseDayToNumber(dayName) {
        const daysMap = {
            'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3,
            'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6
        };
        
        const normalizedDay = dayName.toLowerCase().trim();
        if (daysMap[normalizedDay] !== undefined) {
            return daysMap[normalizedDay];
        }
        
        throw new Error(`Día inválido: ${dayName}`);
    }

    getDayName(dayIndex) {
        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        return days[dayIndex];
    }

    calculateDuration(startTime, endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;
        
        return (endTotal - startTotal) / 60; // Retorna horas
    }

    async getGuardWeeklyHours(guardId, dayOfWeek) {
        // Obtener todas las asignaciones activas del guardia
        const assignments = await this.assignmentRepository.find({
            where: {
                guardId,
                status: 'activo'
            }
        });

        let totalHours = 0;
        assignments.forEach(assignment => {
            const duration = this.calculateDuration(assignment.startTime, assignment.endTime);
            totalHours += duration;
        });

        return totalHours;
    }

    async checkAvailability(req, res) {
        try {
            const { dayOfWeek, startTime, endTime, excludeAssignmentId } = req.query;

            if (!dayOfWeek || !startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros: dayOfWeek, startTime, endTime'
                });
            }

            // Convertir dayOfWeek a número
            const dayNumber = isNaN(dayOfWeek) 
                ? this.parseDayToNumber(dayOfWeek)
                : parseInt(dayOfWeek);

            // Construir query
            const whereClause = {
                dayOfWeek: dayNumber,
                startTime,
                endTime,
                status: 'activo'
            };

            if (excludeAssignmentId) {
                whereClause.id = Not(parseInt(excludeAssignmentId));
            }

            // Buscar asignaciones existentes
            const existingAssignments = await this.assignmentRepository.find({
                where: whereClause,
                relations: ['bikerack', 'guard', 'guard.user']
            });

            // Obtener todos los bicicleteros
            const allBikeracks = await this.bikerackRepository.find();

            // Identificar bicicleteros ocupados
            const occupiedBikerackIds = existingAssignments
                .map(assignment => assignment.bikerackId)
                .filter(id => id !== null);

            // Separar bicicleteros disponibles
            const availableBikeracks = allBikeracks.filter(bikerack => 
                !occupiedBikerackIds.includes(bikerack.id)
            );

            res.json({
                success: true,
                data: {
                    day: this.getDayName(dayNumber),
                    startTime,
                    endTime,
                    availableBikeracks: availableBikeracks.map(b => ({
                        id: b.id,
                        name: b.name,
                        capacity: b.capacity
                    })),
                    occupiedAssignments: existingAssignments.map(a => ({
                        id: a.id,
                        bikerack: a.bikerack ? {
                            id: a.bikerack.id,
                            name: a.bikerack.name
                        } : null,
                        guard: a.guard ? {
                            id: a.guard.id,
                            name: a.guard.user ? 
                                `${a.guard.user.names} ${a.guard.user.lastName}` : 
                                'N/A'
                        } : null
                    })),
                    summary: {
                        totalBikeracks: allBikeracks.length,
                        available: availableBikeracks.length,
                        occupied: occupiedBikerackIds.length
                    }
                }
            });

        } catch (error) {
            console.error('Error checking availability:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor'
            });
        }
    }

    async getByGuard(req, res) {
        try {
            const { guardId } = req.params;

            const assignments = await this.assignmentRepository.find({
                where: {
                    guardId: parseInt(guardId),
                    status: 'activo'
                },
                relations: ['bikerack'],
                order: {
                    dayOfWeek: 'ASC',
                    startTime: 'ASC'
                }
            });

            // Formatear por días de la semana
            const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const scheduleByDay = {};
            
            days.forEach((day, index) => {
                scheduleByDay[day] = [];
            });

            assignments.forEach(assignment => {
                const dayName = days[assignment.dayOfWeek];
                if (scheduleByDay[dayName]) {
                    scheduleByDay[dayName].push({
                        id: assignment.id,
                        startTime: assignment.startTime,
                        endTime: assignment.endTime,
                        schedule: assignment.schedule,
                        bikerack: assignment.bikerack ? {
                            id: assignment.bikerack.id,
                            name: assignment.bikerack.name,
                            capacity: assignment.bikerack.capacity
                        } : null
                    });
                }
            });

            res.json({
                success: true,
                data: {
                    guardId: parseInt(guardId),
                    schedule: scheduleByDay,
                    totalAssignments: assignments.length,
                    totalHours: assignments.reduce((total, assignment) => {
                        return total + this.calculateDuration(assignment.startTime, assignment.endTime);
                    }, 0)
                }
            });

        } catch (error) {
            console.error('Error getting guard assignments:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor'
            });
        }
    }

    async getAllActiveAssignments(req, res) {
        try {
            const assignments = await this.assignmentRepository.find({
                where: { status: 'activo' },
                relations: ['guard', 'guard.user', 'bikerack', 'assignedByUser'],
                order: {
                    dayOfWeek: 'ASC',
                    startTime: 'ASC'
                }
            });

            // Formatear respuesta según rol del usuario
            const formattedAssignments = assignments.map(assignment => {
                const baseData = {
                    id: assignment.id,
                    dayOfWeek: assignment.dayOfWeek,
                    dayName: this.getDayName(assignment.dayOfWeek),
                    startTime: assignment.startTime,
                    endTime: assignment.endTime,
                    duration: this.calculateDuration(assignment.startTime, assignment.endTime),
                    bikerack: {
                        id: assignment.bikerack.id,
                        name: assignment.bikerack.name,
                        capacity: assignment.bikerack.capacity
                    }
                };

                // Información según rol
                if (req.user.role === 'admin') {
                    return {
                        ...baseData,
                        guard: {
                            id: assignment.guard.id,
                            guardNumber: assignment.guard.guardNumber,
                            user: {
                                id: assignment.guard.user.id,
                                names: assignment.guard.user.names,
                                lastName: assignment.guard.user.lastName,
                                email: assignment.guard.user.email
                            }
                        },
                        assignedBy: assignment.assignedByUser ? {
                            id: assignment.assignedByUser.id,
                            names: assignment.assignedByUser.names,
                            lastName: assignment.assignedByUser.lastName
                        } : null,
                        effectiveFrom: assignment.effectiveFrom,
                        effectiveUntil: assignment.effectiveUntil,
                        status: assignment.status
                    };
                } else if (req.user.role === 'guardia') {
                    return {
                        ...baseData,
                        guard: {
                            id: assignment.guard.id,
                            guardNumber: assignment.guard.guardNumber
                        }
                    };
                } else {
                    return {
                        ...baseData,
                        guardName: `${assignment.guard.user.names} ${assignment.guard.user.lastName}`
                    };
                }
            });

            res.json({
                success: true,
                count: assignments.length,
                data: formattedAssignments
            });

        } catch (error) {
            console.error('Error getting assignments:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor'
            });
        }
    }


     async deleteAssignment(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id; // Asumiendo que el middleware authMiddleware agrega req.user
            
            console.log(`🗑️ Usuario ${userId} (admin) eliminando asignación ID: ${id}`);
            
            // Validar que el ID sea un número
            const assignmentId = parseInt(id);
            if (isNaN(assignmentId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de asignación inválido'
                });
            }
            
            // Obtener el repositorio
            const assignmentRepository = AppDataSource.getRepository(GuardAssignmentEntity);
            
            // Buscar la asignación
            const assignment = await assignmentRepository.findOne({
                where: { id: assignmentId },
                relations: ['guard', 'bikerack'] // Si tienes relaciones
            });
            
            // Verificar si existe
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Asignación no encontrada'
                });
            }
            
            // Opcional: Registrar información antes de eliminar
            console.log(`📋 Asignación a eliminar:`, {
                id: assignment.id,
                guardId: assignment.guardId,
                bikerackId: assignment.bikerackId,
                horario: `${assignment.startTime} - ${assignment.endTime}`,
                dia: assignment.dayOfWeek
            });
              await this.historyService.logEvent({
                historyType: 'guard_assignment_removed',
                description: `Asignación eliminada del guardia ${assignment.guard.user.names}`,
                details: {
                    assignmentId: assignment.id,
                    guardId: assignment.guardId,
                    guardName: `${assignment.guard.user.names} ${assignment.guard.user.lastName}`,
                    bikerackId: assignment.bikerackId,
                    bikerackName: assignment.bikerack?.name,
                    schedule: `${assignment.startTime} - ${assignment.endTime}`,
                    deletedBy: req.user.id,
                    deletedAt: new Date()
                },
                assignmentId: assignment.id,
                guardId: assignment.guardId,
                bikerackId: assignment.bikerackId,
                userId: req.user.id
            });
            // Eliminar la asignación
            await assignmentRepository.remove(assignment);
            
            console.log(`✅ Asignación ${assignmentId} eliminada exitosamente`);
            
            return res.status(200).json({
                success: true,
                message: 'Asignación eliminada exitosamente',
                data: {
                    id: assignmentId,
                    guardId: assignment.guardId,
                    bikerackId: assignment.bikerackId
                }
            });
            
        } catch (error) {
            console.error('❌ Error en deleteAssignment:', error);
            
            // Manejar errores específicos de TypeORM
            if (error.code === '23503') { // Foreign key constraint violation
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar la asignación porque tiene registros relacionados'
                });
            }
            
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor al eliminar la asignación',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    // Método alternativo usando delete (sin recuperar el objeto primero)
    async deleteAssignmentAlt(req, res) {
        try {
            const { id } = req.params;
            const assignmentId = parseInt(id);
            
            if (isNaN(assignmentId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }
            
            const assignmentRepository = AppDataSource.getRepository(GuardAssignmentEntity);
            
            // Usar delete para eliminar directamente por ID
            const deleteResult = await assignmentRepository.delete(assignmentId);
            
            if (deleteResult.affected === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Asignación no encontrada'
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Asignación eliminada exitosamente',
                data: { id: assignmentId }
            });
            
        } catch (error) {
            console.error(' Error en deleteAssignmentAlt:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar la asignación',
                error: error.message
            });
        }
    }

    async getAssignmentById(req, res) {
        try {
            const { id } = req.params;
            
            const assignment = await this.assignmentRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['guard', 'guard.user', 'bikerack', 'assignedByUser']
            });

            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Asignación no encontrada'
                });
            }

            // Verificar permisos
            if (req.user.role !== 'admin' && req.user.id !== assignment.guard.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver esta asignación'
                });
            }

            res.json({
                success: true,
                data: {
                    id: assignment.id,
                    dayOfWeek: assignment.dayOfWeek,
                    dayName: this.getDayName(assignment.dayOfWeek),
                    startTime: assignment.startTime,
                    endTime: assignment.endTime,
                    duration: this.calculateDuration(assignment.startTime, assignment.endTime),
                    bikerack: {
                        id: assignment.bikerack.id,
                        name: assignment.bikerack.name,
                        capacity: assignment.bikerack.capacity
                    },
                    guard: {
                        id: assignment.guard.id,
                        guardNumber: assignment.guard.guardNumber,
                        user: {
                            id: assignment.guard.user.id,
                            names: assignment.guard.user.names,
                            lastName: assignment.guard.user.lastName,
                            email: assignment.guard.user.email
                        }
                    },
                    assignedBy: assignment.assignedByUser ? {
                        id: assignment.assignedByUser.id,
                        names: assignment.assignedByUser.names,
                        lastName: assignment.assignedByUser.lastName
                    } : null,
                    effectiveFrom: assignment.effectiveFrom,
                    effectiveUntil: assignment.effectiveUntil,
                    status: assignment.status,
                    createdAt: assignment.createdAt,
                    updatedAt: assignment.updatedAt
                }
            });

        } catch (error) {
            console.error('Error getting assignment:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor'
            });
        }
    }
}

export default GuardAssignmentController;