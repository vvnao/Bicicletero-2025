// src/services/guard.service.js
import { AppDataSource } from "../config/configDb.js";
import { GuardEntity } from "../entities/GuardEntity.js";
import { UserEntity } from "../entities/UserEntity.js";
import { GuardAssignmentEntity } from "../entities/GuardAssignmentEntity.js";

export class GuardService {
    constructor() {
        this.guardRepository = AppDataSource.getRepository(GuardEntity);
        this.userRepository = AppDataSource.getRepository(UserEntity);
        this.assignmentRepository = AppDataSource.getRepository(GuardAssignmentEntity);
    }

    /**
     * Crear un perfil de guardia
     */
   // services/guard.service.js - MEJORADO CON VALIDACIONES
async createGuard(userId, guardData, adminId) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        console.log(`🔍 Creando guardia para usuario ID: ${userId}`);

        // 1. Obtener usuario destino y admin
        const [user, admin] = await Promise.all([
            queryRunner.manager.findOne(UserEntity, {
                where: { id: userId },
                select: ['id', 'names', 'lastName', 'email', 'role', 'isActive', 'rut']
            }),
            queryRunner.manager.findOne(UserEntity, {
                where: { id: adminId },
                select: ['id', 'names', 'lastName']
            })
        ]);

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        if (!admin) {
            throw new Error("Administrador no encontrado");
        }

        console.log(`✅ Usuario destino: ${user.names} ${user.lastName} (Rol: ${user.role})`);
        console.log(`✅ Administrador: ${admin.names} ${admin.lastName}`);

        // 2. Validar que no sea admin
        if (user.role === 'admin') {
            throw new Error("No se puede asignar rol de guardia a un administrador");
        }

        // 3. Validar que no esté inactivo
        if (!user.isActive) {
            throw new Error("El usuario está desactivado. Actívelo primero.");
        }

        // 4. Verificar que no tenga ya perfil de guardia
        const existingGuard = await queryRunner.manager.findOne(GuardEntity, {
            where: { userId: userId }
        });

        if (existingGuard) {
            throw new Error("Este usuario ya tiene un perfil de guardia");
        }

        // 5. Cambiar rol a 'guardia'
        await queryRunner.manager.update(UserEntity, userId, {
            role: 'guardia'
        });

        // 6. Crear perfil de guardia
        const guard = this.guardRepository.create({
            userId: userId,
            ...guardData
        });

        const savedGuard = await queryRunner.manager.save(GuardEntity, guard);

        // 7. Registrar en historial
        const historyService = await import('./history.service.js').then(m => m.default);
        await historyService.logEvent({
            historyType: 'guard_assignment',
            description: `Usuario asignado como guardia por administrador`,
            details: {
                userId: user.id,
                userName: `${user.names} ${user.lastName}`,
                adminId: admin.id,
                adminName: `${admin.names} ${admin.lastName}`,
                previousRole: user.role,
                newRole: 'guardia'
            },
            userId: user.id,
            guardId: admin.id, // El admin que hizo la acción
            ipAddress: guardData.ipAddress,
            userAgent: guardData.userAgent
        });

        await queryRunner.commitTransaction();
        
        // Obtener datos completos para respuesta
        const guardWithRelations = await this.guardRepository.findOne({
            where: { id: savedGuard.id },
            relations: ['user']
        });

        return {
            success: true,
            message: `Usuario ${user.names} ${user.lastName} asignado como guardia exitosamente`,
            data: {
                guard: guardWithRelations,
                user: {
                    id: user.id,
                    names: user.names,
                    lastName: user.lastName,
                    email: user.email,
                    previousRole: user.role,
                    newRole: 'guardia'
                },
                assignedBy: {
                    id: admin.id,
                    names: admin.names,
                    lastName: admin.lastName
                }
            }
        };

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('❌ Error en createGuard:', error);
        throw error;
    } finally {
        await queryRunner.release();
    }
}
    /**
     * Obtener todos los guardias con información de usuario
     */
   async getAllGuards(filters = {}) {
    const query = this.guardRepository.createQueryBuilder('guard')
        .leftJoinAndSelect('guard.user', 'user')
        .leftJoinAndSelect('guard.assignments', 'assignments')
        .where('user.isActive = :isActive', { isActive: true });

    // Aplicar filtros
    if (filters.isAvailable !== undefined) {
        query.andWhere('guard.isAvailable = :isAvailable', { 
            isAvailable: filters.isAvailable 
        });
    }

    if (filters.search) {
        query.andWhere(
            '(user.names LIKE :search OR user.lastName LIKE :search OR user.rut LIKE :search)',
            { search: `%${filters.search}%` }
        );
    }

    // Ordenar por disponibilidad y nombre
    query.orderBy('guard.isAvailable', 'DESC')
         .addOrderBy('user.names', 'ASC');

    return await query.getMany();
}

    /**
     * Obtener guardia por ID con información completa
     */
    async getGuardById(guardId) {
        return await this.guardRepository.findOne({
            where: { id: guardId },
            relations: ['user', 'assignments', 'assignments.bikerack']
        });
    }

    /**
     * Obtener guardia por ID de usuario
     */
    async getGuardByUserId(userId) {
        return await this.guardRepository.findOne({
            where: { userId },
            relations: ['user', 'assignments']
        });
    }

    /**
     * Actualizar información del guardia
     */
    async updateGuard(guardId, updateData) {
        const guard = await this.guardRepository.findOne({
            where: { id: guardId }
        });

        if (!guard) {
            throw new Error("Guardia no encontrado");
        }

        // No permitir actualizar userId
        if (updateData.userId) {
            delete updateData.userId;
        }

        Object.assign(guard, updateData);
        return await this.guardRepository.save(guard);
    }

    /**
     * Cambiar disponibilidad del guardia
     */
    async toggleAvailability(guardId, isAvailable) {
        const guard = await this.guardRepository.findOne({
            where: { id: guardId }
        });

        if (!guard) {
            throw new Error("Guardia no encontrado");
        }

        guard.isAvailable = isAvailable;
        return await this.guardRepository.save(guard);
    }

    /**
     * Desactivar/Activar guardia
     */
    async deactivateGuard(guardId) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // 1. Obtener guardia con usuario
        const guard = await queryRunner.manager.findOne(GuardEntity, {
            where: { id: guardId },
            relations: ['user']
        });

        if (!guard) {
            throw new Error("Guardia no encontrado");
        }

        // 2. Desactivar el usuario
        await queryRunner.manager.update(UserEntity, guard.userId, {
            isActive: false
        });

        // 3. Desactivar todas sus asignaciones activas
        const activeAssignments = await queryRunner.manager.find(GuardAssignmentEntity, {
            where: { 
                guard: { id: guardId },
                status: 'activo' 
            }
        });

        for (const assignment of activeAssignments) {
            assignment.status = 'inactivo';
            await queryRunner.manager.save(GuardAssignmentEntity, assignment);
        }

        // 4. Marcar guardia como no disponible
        guard.isAvailable = false;
        await queryRunner.manager.save(GuardEntity, guard);

        await queryRunner.commitTransaction();
        return { message: "Guardia desactivado exitosamente" };

    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
}

    /**
     * Activar guardia
     */
    async activateGuard(guardId) {
        const guard = await this.guardRepository.findOne({
            where: { id: guardId },
            relations: ['user']
        });

        if (!guard) {
            throw new Error("Guardia no encontrado");
        }

        // Activar el usuario
        await this.userRepository.update(guard.userId, {
            isActive: true
        });

        guard.isAvailable = true;
        return await this.guardRepository.save(guard);
    }

    /**
     * Obtener estadísticas del guardia
     */
    async getGuardStats(guardId) {
        const guard = await this.getGuardById(guardId);
        if (!guard) {
            throw new Error("Guardia no encontrado");
        }

        // Obtener asignaciones completadas
        const completedAssignments = await this.assignmentRepository.count({
            where: {
                guard: { id: guardId },
                status: 'completado'
            }
        });

        // Obtener asignaciones activas
        const activeAssignments = await this.assignmentRepository.count({
            where: {
                guard: { id: guardId },
                status: 'activo'
            }
        });

        // Obtener horas trabajadas (esto es un ejemplo, deberías calcularlo)
        const hoursWorked = completedAssignments * 8; // Asumiendo 8 horas por turno

        return {
            guardId,
            completedAssignments,
            activeAssignments,
            pendingAssignments: guard.assignments?.filter(a => a.status === 'pendiente').length || 0,
            hoursWorked,
            availability: guard.isAvailable,
            rating: guard.rating || 0
        };
    }

    /**
     * Buscar guardias disponibles para una fecha/hora específica
     */
 async findAvailableGuards(date, startTime, endTime) {
    // 1. Obtener todos los guardias disponibles
    const availableGuards = await this.guardRepository.find({
        where: { isAvailable: true },
        relations: ['user', 'assignments', 'assignments.bikerack']
    });

    // 2. Obtener el día de la semana de la fecha solicitada
    const dayOfWeek = this.getDayName(date.getDay());
    
    // 3. Filtrar guardias sin conflictos de horario
    const filteredGuards = await Promise.all(
        availableGuards.map(async (guard) => {
            // Verificar asignaciones activas para el día y hora solicitados
            const conflictingAssignments = guard.assignments?.filter(assignment => {
                // Verificar si la asignación está activa
                if (assignment.status !== 'activo') return false;
                
                // Verificar si el día está en daysOfWeek
                const assignmentDays = assignment.daysOfWeek ? 
                    assignment.daysOfWeek.split(',') : [];
                
                if (!assignmentDays.includes(dayOfWeek)) {
                    return false;
                }

                // Verificar superposición de horarios
                const assignmentStart = this.timeToMinutes(assignment.startTime);
                const assignmentEnd = this.timeToMinutes(assignment.endTime);
                const requestedStart = this.timeToMinutes(startTime);
                const requestedEnd = this.timeToMinutes(endTime);

                return this.isTimeOverlap(
                    assignmentStart, assignmentEnd, 
                    requestedStart, requestedEnd
                );
            });

            // Si no hay conflictos, incluir al guardia
            return conflictingAssignments.length === 0 ? guard : null;
        })
    );

    return filteredGuards.filter(guard => guard !== null);
}

    // Métodos auxiliares
    getDayName(dayIndex) {
        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        return days[dayIndex];
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    isTimeOverlap(start1, end1, start2, end2) {
        return start1 < end2 && end1 > start2;
    }
}

export default new GuardService();