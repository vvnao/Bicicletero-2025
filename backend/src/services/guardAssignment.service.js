// services/guardAssignment.service.js - VERSIÓN COMPLETA
import { AppDataSource } from "../config/configDb.js";
import { GuardAssignmentEntity } from "../entities/GuardAssignmentEntity.js";
import { GuardEntity } from "../entities/GuardEntity.js";
import { BikerackEntity } from "../entities/BikerackEntity.js";
import { UserEntity } from "../entities/UserEntity.js";

export class GuardAssignmentService {
    constructor() {
        this.assignmentRepository = AppDataSource.getRepository(GuardAssignmentEntity);
        this.guardRepository = AppDataSource.getRepository(GuardEntity);
        this.bikerackRepository = AppDataSource.getRepository(BikerackEntity);
        this.userRepository = AppDataSource.getRepository(UserEntity);
    }

    // ========== MÉTODOS PRINCIPALES ==========

    async createAssignment(data, assignedByUserId) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            console.log('🔍 Creando asignación con:', { data, assignedByUserId });

            // 1. Validaciones básicas
            const guard = await queryRunner.manager.findOne(GuardEntity, {
                where: { id: data.guardId }
            });

            if (!guard) {
                throw new Error('Guardia no encontrado');
            }

            const bikerack = await queryRunner.manager.findOne(BikerackEntity, {
                where: { id: data.bikerackId }
            });

            if (!bikerack) {
                throw new Error('Bicicletero no encontrado');
            }

            // 2. Parsear y validar
            const dayOfWeek = typeof data.dayOfWeek === 'string' 
                ? this.parseDayOfWeek(data.dayOfWeek)
                : parseInt(data.dayOfWeek);

            if (!this.isValidTime(data.startTime) || !this.isValidTime(data.endTime)) {
                throw new Error('Formato de hora inválido. Use HH:MM (24h)');
            }

            if (!this.isStartBeforeEnd(data.startTime, data.endTime)) {
                throw new Error('La hora de inicio debe ser menor que la hora de fin');
            }

            // 3. Validar solapamientos
            const hasOverlap = await this.checkForOverlap(
                data.guardId, 
                data.bikerackId, 
                dayOfWeek, 
                data.startTime, 
                data.endTime
            );
            
            if (hasOverlap) {
                throw new Error('Ya existe una asignación en ese horario');
            }

            // 4. Crear asignación
            const assignment = this.assignmentRepository.create({
                guardId: data.guardId,
                bikerackId: data.bikerackId,
                dayOfWeek: dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                assignedBy: parseInt(assignedByUserId),
                effectiveFrom: data.effectiveFrom || new Date(),
                effectiveUntil: data.effectiveUntil || null,
                status: 'activo'
            });

            const savedAssignment = await queryRunner.manager.save(GuardAssignmentEntity, assignment);

            // 5. Actualizar guardia si hay datos adicionales
            if (data.schedule || data.workDays || data.maxHoursPerWeek) {
                await queryRunner.manager.update(GuardEntity, data.guardId, {
                    schedule: data.schedule,
                    workDays: data.workDays,
                    maxHoursPerWeek: data.maxHoursPerWeek
                });
            }

            await queryRunner.commitTransaction();

            // 6. Retornar con relaciones
            const assignmentWithRelations = await this.assignmentRepository.findOne({
                where: { id: savedAssignment.id },
                relations: ['guard', 'guard.user', 'bikerack', 'assignedByUser']
            });

            return {
                success: true,
                message: 'Asignación creada exitosamente',
                data: assignmentWithRelations
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('❌ Error en createAssignment:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

   async getAllActiveAssignments(filters = {}) {
    try {
        const query = this.assignmentRepository
            .createQueryBuilder('assignment')
            .leftJoinAndSelect('assignment.guard', 'guard')
            .leftJoinAndSelect('guard.user', 'user')
            .leftJoinAndSelect('assignment.bikerack', 'bikerack')
            .leftJoinAndSelect('assignment.assignedByUser', 'assignedByUser')
            .where('assignment.status = :status', { status: 'activo' })
            .andWhere('(assignment.effectiveUntil IS NULL OR assignment.effectiveUntil >= CURRENT_DATE)');

        // ... filtros
        
        const assignments = await query.getMany();
        
        // Transformar la respuesta según el rol
        return this.transformAssignments(assignments, filters.role);
        
    } catch (error) {
        throw error;
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