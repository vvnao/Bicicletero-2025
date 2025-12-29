// controllers/guardAssignment.controller.js - CORREGIDO
import { AppDataSource } from '../config/configDb.js'; // IMPORT CORREGIDO
import { GuardAssignmentEntity } from '../entities/GuardAssignmentEntity.js';
import { GuardEntity } from '../entities/GuardEntity.js';
import { BikeRackEntity } from '../entities/BikerackEntity.js';
import { validateCreateAssignment } from '../validations/guardAssignment.validation.js';
import { Not } from 'typeorm';

export class GuardAssignmentController {
    // Obtener repositorios
    get assignmentRepository() {
        return AppDataSource.getRepository(GuardAssignmentEntity);
    }

    get guardRepository() {
        return AppDataSource.getRepository(GuardEntity);
    }

    get bikerackRepository() {
        return AppDataSource.getRepository(BikeRackEntity);
    }

    async create(req, res) {
        try {
            // 1. Validar entrada
            const { error, value } = validateCreateAssignment(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: error.details.map(detail => detail.message)
                });
            }

            const { guardId, bikerackId, dayOfWeek, startTime, endTime } = value;

            // 2. Verificar que el guardia existe
            const guard = await this.guardRepository.findOne({
                where: { 
                    id: guardId,
                    isAvailable: true 
                },
                relations: ['user']
            });

            if (!guard) {
                return res.status(404).json({
                    success: false,
                    message: 'Guardia no encontrado o no está disponible'
                });
            }

            // 3. Verificar que el bicicletero existe
            const bikerack = await this.bikerackRepository.findOne({
                where: { 
                    id: bikerackId,
                    status: 'active' 
                }
            });

            if (!bikerack) {
                return res.status(404).json({
                    success: false,
                    message: 'Bicicletero no encontrado o no está activo'
                });
            }

            // 4. **VALIDACIONES DE CONFLICTO**
            
            // Convertir dayOfWeek a número si es string
            const dayNumber = typeof dayOfWeek === 'string' 
                ? this.parseDayToNumber(dayOfWeek)
                : dayOfWeek;

            // A) Verificar conflicto: mismo guardia + mismo bicicletero + mismo horario
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
                return res.status(400).json({
                    success: false,
                    message: 'Este guardia ya está asignado a este bicicletero en este horario'
                });
            }

            // B) Verificar conflicto: mismo bicicletero + OTRO guardia + mismo horario
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
                return res.status(400).json({
                    success: false,
                    message: 'Este bicicletero ya tiene un guardia asignado en este horario'
                });
            }

            // C) Verificar si el mismo guardia está en otro bicicletero al mismo tiempo
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
                return res.status(400).json({
                    success: false,
                    message: 'Este guardia ya está asignado a otro bicicletero en este horario'
                });
            }

            // 5. Crear la asignación
            const schedule = value.schedule || `${startTime}-${endTime}`;
            
            const newAssignment = this.assignmentRepository.create({
                guardId,
                bikerackId,
                dayOfWeek: dayNumber,
                startTime,
                endTime,
                schedule,
                workDays: value.workDays || '',
                maxHoursPerWeek: value.maxHoursPerWeek || 40,
                effectiveFrom: value.effectiveFrom || new Date(),
                effectiveUntil: value.effectiveUntil || null,
                status: 'activo',
                assignedBy: req.user.id 
            });

            await this.assignmentRepository.save(newAssignment);

            // 6. Obtener con relaciones para la respuesta
            const assignmentWithRelations = await this.assignmentRepository.findOne({
                where: { id: newAssignment.id },
                relations: ['guard', 'guard.user', 'bikerack', 'assignedByUser']
            });

            res.status(201).json({
                success: true,
                message: 'Asignación creada exitosamente',
                data: assignmentWithRelations
            });

        } catch (error) {
            console.error('Error creating assignment:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

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

    async checkAvailability(req, res) {
        try {
            const { dayOfWeek, startTime, endTime, excludeAssignmentId } = req.query;

            if (!dayOfWeek || !startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros: dayOfWeek, startTime, endTime'
                });
            }

            // Convertir dayOfWeek a número si es necesario
            const dayNumber = isNaN(dayOfWeek) 
                ? this.parseDayToNumber(dayOfWeek)
                : parseInt(dayOfWeek);

          
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

            // Obtener todos los bicicleteros activos
            const allBikeracks = await this.bikerackRepository.find({
                where: { status: 'active' }
            });

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
                    availableBikeracks: availableBikeracks.map(b => ({
                        id: b.id,
                        name: b.name,
                        capacity: b.capacity,
                        location: b.location
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
                            location: assignment.bikerack.location
                        } : null
                    });
                }
            });

            res.json({
                success: true,
                data: {
                    guardId: parseInt(guardId),
                    schedule: scheduleByDay,
                    totalAssignments: assignments.length
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
                relations: ['guard', 'guard.user', 'bikerack'],
                order: {
                    dayOfWeek: 'ASC',
                    startTime: 'ASC'
                }
            });

            res.json({
                success: true,
                count: assignments.length,
                data: assignments
            });

        } catch (error) {
            console.error('Error getting assignments:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor'
            });
        }
    }

transformAssignments(assignments, role = 'public') {
    return assignments.map(assignment => {
        const baseData = {
            id: assignment.id,
            dayOfWeek: assignment.dayOfWeek,
            startTime: assignment.startTime,
            endTime: assignment.endTime,
            bikerack: {
                id: assignment.bikerack.id,
                name: assignment.bikerack.name,
                capacity: assignment.bikerack.capacity
            }
        };

        switch(role) {
            case 'admin':
                return {
                    ...baseData,
                    guard: {
                        id: assignment.guard.id,
                        phone: assignment.guard.phone,
                        user: {
                            id: assignment.guard.user.id,
                            names: assignment.guard.user.names,
                            lastName: assignment.guard.user.lastName,
                            email: assignment.guard.user.email,
                            contact: assignment.guard.user.contact
                        }
                    },
                    assignedByUser: {
                        id: assignment.assignedByUser.id,
                        names: assignment.assignedByUser.names,
                        lastName: assignment.assignedByUser.lastName
                    },
                    createdAt: assignment.createdAt,
                    updatedAt: assignment.updatedAt
                };
                
            case 'guardia':
                return {
                    ...baseData,
                    guard: {
                        id: assignment.guard.id,
                        phone: assignment.guard.phone,
                        user: {
                            names: assignment.guard.user.names,
                            lastName: assignment.guard.user.lastName,
                            contact: assignment.guard.user.contact
                        }
                    }
                };
                
            case 'public':
            default:
                return {
                    ...baseData,
                    guardName: `${assignment.guard.user.names} ${assignment.guard.user.lastName}`,
                    guardPhone: assignment.guard.phone,
                    emergencyContact: assignment.guard.emergencyContact,
                    emergencyPhone: assignment.guard.emergencyPhone
                };
        }
    });
}
    async getAssignmentById(id) {
        try {
            return await this.assignmentRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['guard', 'guard.user', 'bikerack', 'assignedByUser']
            });
        } catch (error) {
            console.error('Error obteniendo asignación por ID:', error);
            throw error;
        }
    }

    async updateAssignment(id, updateData) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const assignment = await queryRunner.manager.findOne(GuardAssignmentEntity, {
                where: { id: parseInt(id) }
            });

            if (!assignment) {
                throw new Error('Asignación no encontrada');
            }

            // Validar tiempos si se actualizan
            if (updateData.startTime || updateData.endTime) {
                const startTime = updateData.startTime || assignment.startTime;
                const endTime = updateData.endTime || assignment.endTime;
                
                if (!this.isStartBeforeEnd(startTime, endTime)) {
                    throw new Error('La hora de inicio debe ser menor que la hora de fin');
                }
            }

            // Actualizar
            Object.assign(assignment, updateData);
            const updated = await queryRunner.manager.save(GuardAssignmentEntity, assignment);

            await queryRunner.commitTransaction();
            return updated;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deactivateAssignment(id) {
        try {
            const assignment = await this.assignmentRepository.findOne({
                where: { id: parseInt(id) }
            });

            if (!assignment) {
                throw new Error('Asignación no encontrada');
            }

            assignment.status = 'inactivo';
            assignment.effectiveUntil = new Date();
            
            return await this.assignmentRepository.save(assignment);
        } catch (error) {
            console.error('Error desactivando asignación:', error);
            throw error;
        }
    }

    async getAssignmentsByBikerack(bikerackId) {
        try {
            return await this.assignmentRepository.find({
                where: { 
                    bikerackId: parseInt(bikerackId),
                    status: 'activo'
                },
                relations: ['guard', 'guard.user'],
                order: {
                    dayOfWeek: 'ASC',
                    startTime: 'ASC'
                }
            });
        } catch (error) {
            console.error('Error obteniendo asignaciones por bicicletero:', error);
            throw error;
        }
    }

    async getAssignmentsByGuard(guardId) {
        try {
            return await this.assignmentRepository.find({
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
        } catch (error) {
            console.error('Error obteniendo asignaciones por guardia:', error);
            throw error;
        }
    }

    // ========== MÉTODOS AUXILIARES ==========

    parseDayOfWeek(dayName) {
        const daysMap = {
            'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3,
            'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6
        };
        
        const normalizedDay = dayName.toLowerCase().trim();
        if (daysMap[normalizedDay] !== undefined) {
            return daysMap[normalizedDay];
        }
        
        const dayNum = parseInt(dayName);
        if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
            return dayNum;
        }
        
        throw new Error(`Día inválido: ${dayName}`);
    }

    isValidTime(time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    isStartBeforeEnd(startTime, endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;
        
        return startTotal < endTotal;
    }

    async checkForOverlap(guardId, bikerackId, dayOfWeek, startTime, endTime) {
        // Verificar solapamientos del guardia
        const guardOverlap = await this.assignmentRepository
            .createQueryBuilder('assignment')
            .where('assignment.guardId = :guardId', { guardId })
            .andWhere('assignment.dayOfWeek = :dayOfWeek', { dayOfWeek })
            .andWhere('assignment.status = :status', { status: 'activo' })
            .andWhere('(assignment.effectiveUntil IS NULL OR assignment.effectiveUntil >= CURRENT_DATE)')
            .andWhere(`
                (assignment.startTime < :endTime AND assignment.endTime > :startTime)
            `, { startTime, endTime })
            .getOne();

        if (guardOverlap) {
            return true;
        }

        // Verificar solapamientos del bicicletero
        const bikerackOverlap = await this.assignmentRepository
            .createQueryBuilder('assignment')
            .where('assignment.bikerackId = :bikerackId', { bikerackId })
            .andWhere('assignment.dayOfWeek = :dayOfWeek', { dayOfWeek })
            .andWhere('assignment.status = :status', { status: 'activo' })
            .andWhere('(assignment.effectiveUntil IS NULL OR assignment.effectiveUntil >= CURRENT_DATE)')
            .andWhere(`
                (assignment.startTime < :endTime AND assignment.endTime > :startTime)
            `, { startTime, endTime })
            .getOne();

        return !!bikerackOverlap;
    }

    getDayName(dayIndex) {
        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        return days[dayIndex];
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
}