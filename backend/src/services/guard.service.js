// services/guard.service.js - VERSIÓN COMPLETA CORREGIDA
import { AppDataSource } from "../config/configDb.js";
import { GuardEntity } from "../entities/GuardEntity.js";
import { UserEntity } from "../entities/UserEntity.js";
import bcrypt from 'bcryptjs';

export class GuardService {
    constructor() {
        this.guardRepository = AppDataSource.getRepository(GuardEntity);
        this.userRepository = AppDataSource.getRepository(UserEntity);
    }

    /**
     * Obtener el próximo número de guardia
     */
    async getNextGuardNumber() {
        try {
            const lastGuard = await this.guardRepository
                .createQueryBuilder('guard')
                .orderBy('guard.guardNumber', 'DESC')
                .getOne();
            
            return lastGuard ? lastGuard.guardNumber + 1 : 1;
        } catch (error) {
            console.error('Error obteniendo próximo número de guardia:', error);
            return 1; // Si hay error, empieza desde 1
        }
    }

    /**
     * Crear un nuevo guardia (con usuario)
     */
   async createGuard(guardData, adminId) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // 1. Verificar si el email ya existe
        const existingUser = await queryRunner.manager.findOne(UserEntity, {
            where: { email: guardData.email }
        });

        if (existingUser) {
            throw new Error('El email ya está registrado');
        }

        // 2. Obtener información del admin
        const admin = await queryRunner.manager.findOne(UserEntity, {
            where: { id: adminId },
            select: ['id', 'names', 'lastName']
        });

        if (!admin) {
            throw new Error("Administrador no encontrado");
        }

        // 3. OBTENER EL PRÓXIMO NÚMERO DE GUARDIA DENTRO DE LA TRANSACCIÓN
       const lastGuard = await queryRunner.manager
    .createQueryBuilder(GuardEntity, 'guard')
    .orderBy('guard.guardNumber', 'DESC')
    .getOne();

const nextGuardNumber = lastGuard && lastGuard.guardNumber ? 
    lastGuard.guardNumber + 1 : 1;

        // 4. Definir contraseña
        let password = guardData.password;
        let isTemporaryPassword = false;
        
        if (!password) {
            password = Math.random().toString(36).slice(-8);
            isTemporaryPassword = true;
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Generar RUT temporal si no viene
        const rut = guardData.rut || this.generateTemporaryRUT();

        // 6. Crear usuario CON ROL 'guardia'
        const user = this.userRepository.create({
            names: guardData.names,
            lastName: guardData.lastName,
            email: guardData.email,
            rut: rut,
            password: hashedPassword,
            role: 'guardia',
            typePerson: guardData.typePerson || 'funcionario',
            requestStatus: 'aprobado',
            isActive: true,
            mustChangePassword: isTemporaryPassword,
            contact: guardData.phone
        });

        const savedUser = await queryRunner.manager.save(UserEntity, user);

        // 7. Crear perfil de guardia
        const guard = this.guardRepository.create({
            userId: savedUser.id,
             guardNumber: nextGuardNumber,
            phone: guardData.phone,
            address: guardData.address,
            emergencyContact: guardData.emergencyContact,
            emergencyPhone: guardData.emergencyPhone,
            rating: 0,
            isAvailable: true
        });

        const savedGuard = await queryRunner.manager.save(GuardEntity, guard);

        // 8. Registrar en historial (opcional)
        try {
            const historyService = await import('./history.service.js').then(m => m.default);
            await historyService.logEvent({
                historyType: 'guard_assignment',
                description: `Nuevo guardia #${nextGuardNumber} ${guardData.names} ${guardData.lastName} creado`,
                details: {
                    action: 'create_guard',
                    guardProfileId: savedGuard.id,
                    guardUserId: savedUser.id,
                    guardNumber: nextGuardNumber,
                    guardName: `${guardData.names} ${guardData.lastName}`,
                    adminId: admin.id,
                    adminName: `${admin.names} ${admin.lastName}`,
                    email: guardData.email
                },
                userId: admin.id,
                guardId: savedGuard.id,
                ipAddress: guardData.ipAddress,
                userAgent: guardData.userAgent
            });
        } catch (historyError) {
            console.warn('⚠️ No se pudo registrar en historial:', historyError.message);
        }

        await queryRunner.commitTransaction();

        // 9. Obtener datos completos para respuesta
        const guardWithUser = await this.guardRepository.findOne({
            where: { id: savedGuard.id },
            relations: ['user'],
            select: {
                id: true,
                userId: true,
                guardNumber: true,
                phone: true,
                address: true,
                emergencyContact: true,
                emergencyPhone: true,
                rating: true,
                isAvailable: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    id: true,
                    role: true,
                    names: true,
                    lastName: true,
                    rut: true,
                    email: true,
                    typePerson: true,
                    isActive: true,
                    requestStatus: true,
                    contact: true
                }
            }
        });

        return {
            success: true,
             message: `Guardia creado exitosamente`,
            data: {
                guard: guardWithUser,
                credentials: {
                    email: guardData.email,
                    password: isTemporaryPassword ? password : undefined,
                    isTemporaryPassword: isTemporaryPassword,
                    rut: rut
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
        try {
            const query = this.guardRepository.createQueryBuilder('guard')
                .leftJoinAndSelect('guard.user', 'user')
                .where('user.isActive = :isActive', { isActive: true });

            // Aplicar filtros
            if (filters.isAvailable !== undefined) {
                query.andWhere('guard.isAvailable = :isAvailable', { 
                    isAvailable: filters.isAvailable === 'true' 
                });
            }

            if (filters.search) {
                query.andWhere(
                    '(user.names LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR guard.guardNumber = :searchNum)',
                    { 
                        search: `%${filters.search}%`,
                        searchNum: !isNaN(filters.search) ? parseInt(filters.search) : 0
                    }
                );
            }

            // Ordenar por número de guardia
            query.orderBy('guard.guardNumber', 'ASC');

            return await query.getMany();
        } catch (error) {
            console.error('Error en getAllGuards:', error);
            throw error;
        }
    }

    /**
     * Obtener guardia por ID
     */
    async getGuardById(guardId) {
        try {
            return await this.guardRepository.findOne({
                where: { id: guardId },
                relations: ['user', 'assignments']
            });
        } catch (error) {
            console.error('Error obteniendo guardia por ID:', error);
            throw error;
        }
    }

    /**
     * Obtener guardia por userId
     */
    async getGuardByUserId(userId) {
        try {
            return await this.guardRepository.findOne({
                where: { userId: userId },
                relations: ['user']
            });
        } catch (error) {
            console.error('Error obteniendo guardia por userId:', error);
            throw error;
        }
    }

    /**
     * Obtener guardia por email
     */
    async getGuardByEmail(email) {
        try {
            return await this.guardRepository
                .createQueryBuilder('guard')
                .leftJoinAndSelect('guard.user', 'user')
                .where('user.email = :email', { email })
                .getOne();
        } catch (error) {
            console.error('Error obteniendo guardia por email:', error);
            throw error;
        }
    }

    /**
     * Obtener guardia por número de guardia
     */
    async getGuardByNumber(guardNumber) {
        try {
            return await this.guardRepository.findOne({
                where: { guardNumber: guardNumber },
                relations: ['user']
            });
        } catch (error) {
            console.error('Error obteniendo guardia por número:', error);
            throw error;
        }
    }

    /**
     * Actualizar información del guardia
     */
    async updateGuard(guardId, updateData, currentUserId, currentUserRole) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const guard = await queryRunner.manager.findOne(GuardEntity, {
                where: { id: guardId },
                relations: ['user']
            });

            if (!guard) {
                throw new Error("Guardia no encontrado");
            }

            // Validar permisos
            if (currentUserRole !== 'admin' && currentUserId !== guard.userId) {
                throw new Error("No tienes permisos para editar este guardia");
            }

            // Si NO es admin, solo puede editar ciertos campos
            if (currentUserRole !== 'admin') {
                const allowedFields = ['phone', 'address', 'schedule', 'workDays'];
                const unauthorizedFields = Object.keys(updateData).filter(
                    field => !allowedFields.includes(field)
                );
                
                if (unauthorizedFields.length > 0) {
                    throw new Error(`Solo puedes editar: ${allowedFields.join(', ')}`);
                }
            }

            // No permitir cambiar el número de guardia
            if (updateData.guardNumber) {
                delete updateData.guardNumber;
            }

            // Si se actualizan datos de usuario
            if (updateData.names || updateData.lastName || updateData.email || updateData.contact) {
                const userUpdate = {};
                
                if (updateData.names) {
                    userUpdate.names = updateData.names;
                    delete updateData.names;
                }
                
                if (updateData.lastName) {
                    userUpdate.lastName = updateData.lastName;
                    delete updateData.lastName;
                }
                
                if (updateData.email) {
                    // Verificar que el email no esté en uso por otro usuario
                    const existingUser = await queryRunner.manager.findOne(UserEntity, {
                        where: { 
                            email: updateData.email,
                            id: guard.userId
                        }
                    });
                    
                    if (!existingUser) {
                        const emailExists = await queryRunner.manager.findOne(UserEntity, {
                            where: { 
                                email: updateData.email,
                                id: { $not: guard.userId }
                            }
                        });
                        
                        if (emailExists) {
                            throw new Error('El email ya está en uso por otro usuario');
                        }
                    }
                    
                    userUpdate.email = updateData.email;
                    delete updateData.email;
                }

                if (updateData.contact) {
                    userUpdate.contact = updateData.contact;
                    // También actualizar en guardia si es teléfono
                    if (!updateData.phone) {
                        updateData.phone = updateData.contact;
                    }
                    delete updateData.contact;
                }
                
                if (Object.keys(userUpdate).length > 0) {
                    await queryRunner.manager.update(UserEntity, guard.userId, userUpdate);
                }
            }

            // Actualizar campos del guardia
            if (Object.keys(updateData).length > 0) {
                await queryRunner.manager.update(GuardEntity, guardId, updateData);
            }

            await queryRunner.commitTransaction();

            // Retornar guardia actualizado
            return await this.getGuardById(guardId);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error actualizando guardia:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Cambiar disponibilidad del guardia
     */
    async toggleAvailability(guardId, isAvailable) {
        try {
            const guard = await this.guardRepository.findOne({
                where: { id: guardId }
            });

            if (!guard) {
                throw new Error("Guardia no encontrado");
            }

            guard.isAvailable = isAvailable;
            return await this.guardRepository.save(guard);
        } catch (error) {
            console.error('Error cambiando disponibilidad:', error);
            throw error;
        }
    }

    /**
     * Desactivar guardia (solo admin)
     */
    async deactivateGuard(guardId) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const guard = await queryRunner.manager.findOne(GuardEntity, {
                where: { id: guardId },
                relations: ['user']
            });

            if (!guard) {
                throw new Error("Guardia no encontrado");
            }

            // Desactivar el usuario
            await queryRunner.manager.update(UserEntity, guard.userId, {
                isActive: false
            });

            // Desactivar guardia
            guard.isAvailable = false;
            await queryRunner.manager.save(GuardEntity, guard);

            await queryRunner.commitTransaction();

            return { 
                success: true,
                message: `Guardia #${guard.guardNumber} desactivado exitosamente`,
                guardId: guardId,
                guardNumber: guard.guardNumber
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error desactivando guardia:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Activar guardia (solo admin)
     */
    async activateGuard(guardId) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const guard = await queryRunner.manager.findOne(GuardEntity, {
                where: { id: guardId },
                relations: ['user']
            });

            if (!guard) {
                throw new Error("Guardia no encontrado");
            }

            // Activar el usuario
            await queryRunner.manager.update(UserEntity, guard.userId, {
                isActive: true
            });

            // Activar guardia
            guard.isAvailable = true;
            await queryRunner.manager.save(GuardEntity, guard);

            await queryRunner.commitTransaction();

            return guard;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error activando guardia:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Obtener estadísticas del guardia
     */
    async getGuardStats(guardId) {
        try {
            const guard = await this.getGuardById(guardId);
            if (!guard) {
                throw new Error("Guardia no encontrado");
            }

            // Aquí puedes agregar más estadísticas según tus necesidades
            return {
                guardId: guard.id,
                guardNumber: guard.guardNumber,
                guardName: `${guard.user.names} ${guard.user.lastName}`,
                availability: guard.isAvailable,
                rating: guard.rating || 0,
                schedule: guard.schedule,
                workDays: guard.workDays,
                maxHoursPerWeek: guard.maxHoursPerWeek,
                // Agregar más estadísticas aquí
                assignmentsCount: guard.assignments?.length || 0
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    /**
     * Generar RUT temporal
     */
    generateTemporaryRUT() {
        const randomNum = Math.floor(Math.random() * 25000000) + 1000000;
        const rutNum = randomNum.toString();
        const dv = this.calculateDV(rutNum);
        return `${rutNum.slice(0, 2)}.${rutNum.slice(2, 5)}.${rutNum.slice(5)}-${dv}`;
    }

    /**
     * Calcular dígito verificador
     */
    calculateDV(rut) {
        let sum = 0;
        let mul = 2;
        
        for (let i = rut.length - 1; i >= 0; i--) {
            sum += parseInt(rut.charAt(i)) * mul;
            mul = mul === 7 ? 2 : mul + 1;
        }
        
        const res = 11 - (sum % 11);
        
        if (res === 11) return '0';
        if (res === 10) return 'K';
        return res.toString();
    }

    /**
     * Buscar guardias disponibles para una fecha/hora específica
     */
    async findAvailableGuards(date, startTime, endTime) {
        try {
            // 1. Obtener todos los guardias disponibles
            const availableGuards = await this.guardRepository.find({
                where: { isAvailable: true },
                relations: ['user', 'assignments']
            });

            // 2. Filtrar por horario
            const filteredGuards = availableGuards.filter(guard => {
                if (!guard.schedule || !guard.workDays) return true;

                // Verificar si trabaja en el día solicitado
                const requestedDate = new Date(date);
                const dayOfWeek = requestedDate.getDay();
                
                // Convertir workDays string a array de números
                const workDaysArray = this.parseWorkDays(guard.workDays);
                
                if (!workDaysArray.includes(dayOfWeek)) {
                    return false;
                }

                // Verificar horario
                if (!guard.schedule) return true;
                
                const [guardStart, guardEnd] = guard.schedule.split('-').map(t => t.trim());
                
                const requestedStartMinutes = this.timeToMinutes(startTime);
                const requestedEndMinutes = this.timeToMinutes(endTime);
                const guardStartMinutes = this.timeToMinutes(guardStart);
                const guardEndMinutes = this.timeToMinutes(guardEnd);
                
                return requestedStartMinutes >= guardStartMinutes && 
                       requestedEndMinutes <= guardEndMinutes;
            });

            return filteredGuards.map(guard => ({
                id: guard.id,
                guardNumber: guard.guardNumber,
                name: `${guard.user.names} ${guard.user.lastName}`,
                email: guard.user.email,
                phone: guard.phone,
                schedule: guard.schedule,
                workDays: guard.workDays,
                rating: guard.rating
            }));

        } catch (error) {
            console.error('Error buscando guardias disponibles:', error);
            throw error;
        }
    }

    /**
     * Métodos auxiliares
     */
    parseWorkDays(workDaysString) {
        if (!workDaysString) return [];
        
        const daysMap = {
            'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4,
            'viernes': 5, 'sábado': 6, 'domingo': 0
        };
        
        return workDaysString.split(',')
            .map(day => day.trim().toLowerCase())
            .filter(day => daysMap[day] !== undefined)
            .map(day => daysMap[day]);
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    getDayName(dayIndex) {
        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        return days[dayIndex];
    }
}

export default GuardService;