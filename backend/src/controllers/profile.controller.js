import { AppDataSource } from "../config/configDb.js";
import UserEntity from "../entities/UserEntity.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { getPrivateProfileService, getProfilesService, softActiveProfileService, softDeleteProfileService, updatePrivateProfileService } from "../services/profile.service.js";

export async function getPrivateProfile(req, res) {
    try {
        const userId = req.user.id;

        const data = await getPrivateProfileService(userId);

        if (!data) return handleErrorClient(res, 404, "Usuario no encontrado");

        delete data.password;

        return handleSuccess(res, 200, "Perfil privado obtenido exitosamente", {
            userData: data,
        });
    } catch (error) {
        return handleErrorServer(res, 500, "Error del servidor", error);
    }
}

export async function getProfiles(req, res) {
    try {
        const { role } = req.user;
        const data = await getProfilesService(role);

        if (!data) return handleErrorClient(res, 403, "No tienes permiso para acceder a esta información");

        data.forEach(user => {
            delete user.password;
        });

        return handleSuccess(res, 200, "Perfiles obtenidos exitosamente", data);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener perfiles", error);
    }
}
export async function updatePrivateProfile(req, res) {
    try {
        const userId = req.user.id;

        const { email, contact } = req.body;

        const data = { email, contact };

        const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

        if (req.files) {
            if (req.files['tnePhoto']) {
                const filename = req.files['tnePhoto'][0].filename;
                data.tnePhoto = `${baseUrl}/uploads/tne/${filename}`;
            }
            if (req.files['personalPhoto']) {
                const filename = req.files['personalPhoto'][0].filename;
                data.personalPhoto = `${baseUrl}/uploads/personal/${filename}`;
            }
        }

        const updatedUser = await updatePrivateProfileService(userId, data);

        if (!updatedUser) {
            return handleErrorClient(res, 404, "Usuario no encontrado");
        }

        return handleSuccess(res, 200, "Perfil actualizado exitosamente", {
            email: updatedUser.email,
            contact: updatedUser.contact,
            tnePhoto: updatedUser.tnePhoto,
            personalPhoto: updatedUser.personalPhoto,
        });
    } catch (error) {
        handleErrorServer(res, 500, "Error al actualizar perfil", error);
    }
}
//Solo el administrador podrá desactivar perfiles
export async function softDeleteProfileUser(req, res) {
    try {
        const role = req.user.role;
        const { rut } = req.body;

        if (role !== "admin") {
            return handleErrorClient(res, 403, "No posee los permisos para realizar esta acción");
        }

        const user = await softDeleteProfileService(rut);

        if (!user) {
            return handleErrorClient(res, 404, "Usuario no encontrado");
        }
        if (user === "false") {
            return handleErrorClient(res, 400, "El perfil ya está desactivado");
        }
        if (user.role === req.user.role) {
            return handleErrorClient(res, 400, "No puede desactivar su propio perfil");
        }

        return handleSuccess(res, 200, "Perfil desactivado exitosamente");
    } catch (error) {
        return handleErrorServer(res, 500, "Error del servidor");
    }
}
export async function softActivateProfile(req, res) {
    try {
        const role = req.user.role;
        const { rut } = req.body;

        if (role !== "admin") {
            return handleErrorClient(res, 403, "No posee los permisos para realizar esta acción");
        }

        const user = await softActiveProfileService(rut);

        if (!user) {
            return handleErrorClient(res, 404, "Usuario no encontrado");
        }
        if (user === "true") {
            return handleErrorClient(res, 400, "El perfil ya está activado");
        }

        return handleSuccess(res, 200, "Perfil activado exitosamente");
    } catch (error) {
        return handleErrorServer(res, 500, "Error del servidor");
    }
}

export async function getAssignableUsers(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return handleErrorClient(res, 403, 'Solo administradores pueden ver usuarios asignables');
        }

        const userRepository = AppDataSource.getRepository('User');
        const guardRepository = AppDataSource.getRepository('Guard');

        const { search, includeCurrentGuards = false } = req.query;

        let query = userRepository.createQueryBuilder('user')
            .select([
                'user.id',
                'user.names',
                'user.lastName',
                'user.email',
                'user.rut',
                'user.role',
                'user.isActive',
                'user.typePerson',
                'user.created_at'
            ])
            .where('user.isActive = :isActive', { isActive: true })
            .andWhere('user.role != :adminRole', { adminRole: 'admin' })
            .orderBy('user.names', 'ASC');

        if (search && search.trim() !== '') {
            query.andWhere(
                '(user.names ILIKE :search OR user.lastName ILIKE :search OR user.rut ILIKE :search OR user.email ILIKE :search)',
                { search: `%${search.trim()}%` }
            );
        }

        const users = await query.getMany();

        const usersWithStatus = await Promise.all(
            users.map(async (user) => {
                const existingGuard = await guardRepository.findOne({
                    where: { userId: user.id },
                    select: ['id', 'isAvailable', 'rating']
                });

                return {
                    id: user.id,
                    personalInfo: {
                        names: user.names,
                        lastName: user.lastName,
                        fullName: `${user.names} ${user.lastName}`,
                        email: user.email,
                        rut: user.rut,
                        typePerson: user.typePerson,
                        memberSince: user.created_at
                    },
                    currentStatus: {
                        role: user.role,
                        isActive: user.isActive,
                        isAlreadyGuard: !!existingGuard
                    },
                    guardInfo: existingGuard ? {
                        id: existingGuard.id,
                        isAvailable: existingGuard.isAvailable,
                        rating: existingGuard.rating
                    } : null,
                    canBeAssigned: !existingGuard
                };
            })
        );

        const filteredUsers = includeCurrentGuards === 'true'
            ? usersWithStatus
            : usersWithStatus.filter(user => user.canBeAssigned);

        const stats = {
            totalUsers: users.length,
            assignableUsers: usersWithStatus.filter(user => user.canBeAssigned).length,
            currentGuards: usersWithStatus.filter(user => user.currentStatus.isAlreadyGuard).length,
            byType: {
                estudiante: usersWithStatus.filter(user => user.personalInfo.typePerson === 'estudiante').length,
                academico: usersWithStatus.filter(user => user.personalInfo.typePerson === 'academico').length,
                funcionario: usersWithStatus.filter(user => user.personalInfo.typePerson === 'funcionario').length
            }
        };

        return handleSuccess(res, 200, 'Usuarios asignables obtenidos exitosamente', {
            stats,
            users: filteredUsers,
            filters: {
                search: search || '',
                includeCurrentGuards: includeCurrentGuards === 'true'
            }
        });

    } catch (error) {
        console.error('Error en getAssignableUsers:', error);
        return handleErrorServer(res, 500, 'Error al obtener usuarios asignables', error.message);
    }
}

export async function quickSearchUser(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return handleErrorClient(res, 403, 'Solo administradores pueden buscar usuarios');
        }

        const { query } = req.query;

        if (!query || query.trim().length < 2) {
            return handleErrorClient(res, 400, 'Ingrese al menos 2 caracteres para buscar');
        }

        const userRepository = AppDataSource.getRepository('User');
        const guardRepository = AppDataSource.getRepository('Guard');

        let user = await userRepository.findOne({
            where: { rut: query.trim() },
            select: ['id', 'names', 'lastName', 'email', 'rut', 'role', 'isActive', 'typePerson']
        });

        if (!user) {
            user = await userRepository.findOne({
                where: [
                    { email: query.trim() },
                    { names: query.trim() }
                ],
                select: ['id', 'names', 'lastName', 'email', 'rut', 'role', 'isActive', 'typePerson']
            });
        }

        if (!user) {
            const users = await userRepository.createQueryBuilder('user')
                .select(['user.id', 'user.names', 'user.lastName', 'user.email', 'user.rut', 'user.role', 'user.isActive'])
                .where('user.isActive = :isActive', { isActive: true })
                .andWhere('(user.names ILIKE :query OR user.lastName ILIKE :query OR user.rut ILIKE :query)')
                .setParameter('query', `%${query.trim()}%`)
                .limit(5)
                .getMany();

            if (users.length === 0) {
                return handleErrorClient(res, 404, 'No se encontraron usuarios con ese criterio');
            }

            const usersWithStatus = await Promise.all(
                users.map(async (u) => {
                    const existingGuard = await guardRepository.findOne({
                        where: { userId: u.id }
                    });

                    return {
                        id: u.id,
                        fullName: `${u.names} ${u.lastName}`,
                        rut: u.rut,
                        email: u.email,
                        role: u.role,
                        isAlreadyGuard: !!existingGuard,
                        canBeAssigned: !existingGuard && u.role !== 'admin'
                    };
                })
            );

            return handleSuccess(res, 200, 'Múltiples usuarios encontrados', {
                type: 'multiple',
                count: usersWithStatus.length,
                users: usersWithStatus,
                searchQuery: query
            });
        }

        const existingGuard = await guardRepository.findOne({
            where: { userId: user.id }
        });

        const userInfo = {
            id: user.id,
            fullName: `${user.names} ${user.lastName}`,
            rut: user.rut,
            email: user.email,
            role: user.role,
            typePerson: user.typePerson,
            isActive: user.isActive,
            isAlreadyGuard: !!existingGuard,
            canBeAssigned: !existingGuard && user.role !== 'admin',
            guardInfo: existingGuard ? {
                id: existingGuard.id,
                isAvailable: existingGuard.isAvailable
            } : null
        };

        return handleSuccess(res, 200, 'Usuario encontrado', {
            type: 'single',
            user: userInfo,
            searchQuery: query
        });

    } catch (error) {
        console.error('Error en quickSearchUser:', error);
        return handleErrorServer(res, 500, 'Error en búsqueda de usuario', error.message);
    }
}

export async function getUserDetailsForAssignment(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return handleErrorClient(res, 403, 'Solo administradores pueden ver información detallada de usuarios');
        }

        const { userId } = req.params;

        const userRepository = AppDataSource.getRepository('User');
        const guardRepository = AppDataSource.getRepository('Guard');
        const bicycleRepository = AppDataSource.getRepository('Bicycle');
        const historyRepository = AppDataSource.getRepository('History');

        const user = await userRepository.findOne({
            where: { id: parseInt(userId) },
            select: ['id', 'names', 'lastName', 'email', 'rut', 'role', 'isActive', 'typePerson', 'contact', 'created_at']
        });

        if (!user) {
            return handleErrorClient(res, 404, 'Usuario no encontrado');
        }

        const existingGuard = await guardRepository.findOne({
            where: { userId: user.id },
            relations: ['assignments']
        });

        const bicycles = await bicycleRepository.find({
            where: { user: { id: user.id } },
            select: ['id', 'brand', 'model', 'color', 'serialNumber', 'photo']
        });

        const recentHistory = await historyRepository.find({
            where: { user: { id: user.id } },
            order: { timestamp: 'DESC' },
            take: 5,
            relations: ['bikerack', 'space']
        });

        const activeReservations = await AppDataSource.getRepository('Reservation').find({
            where: {
                user: { id: user.id },
                status: 'Activa'
            },
            relations: ['space', 'space.bikerack'],
            take: 3
        });

        const userDetails = {
            personalInfo: {
                id: user.id,
                fullName: `${user.names} ${user.lastName}`,
                rut: user.rut,
                email: user.email,
                contact: user.contact || 'No registrado',
                typePerson: user.typePerson,
                memberSince: user.created_at,
                isActive: user.isActive
            },
            currentStatus: {
                role: user.role,
                isAlreadyGuard: !!existingGuard,
                canBeAssigned: !existingGuard && user.role !== 'admin' && user.isActive
            },
            guardInfo: existingGuard ? {
                id: existingGuard.id,
                isAvailable: existingGuard.isAvailable,
                rating: existingGuard.rating,
                maxHoursPerWeek: existingGuard.maxHoursPerWeek,
                activeAssignments: existingGuard.assignments?.filter(a => a.status === 'activo').length || 0,
                totalAssignments: existingGuard.assignments?.length || 0
            } : null,
            assets: {
                bicycles: bicycles.map(bike => ({
                    id: bike.id,
                    brand: bike.brand || 'Sin marca',
                    model: bike.model || 'Sin modelo',
                    color: bike.color || 'Sin color',
                    serialNumber: bike.serialNumber || 'Sin número de serie'
                })),
                bicycleCount: bicycles.length
            },
            activity: {
                recentHistory: recentHistory.map(record => ({
                    id: record.id,
                    type: record.historyType,
                    description: record.description,
                    timestamp: record.timestamp,
                    location: record.bikerack?.name || 'Desconocido',
                    spaceCode: record.space?.spaceCode
                })),
                activeReservations: activeReservations.map(res => ({
                    id: res.id,
                    reservationCode: res.reservationCode,
                    spaceCode: res.space?.spaceCode,
                    bikerack: res.space?.bikerack?.name,
                    status: res.status
                })),
                reservationCount: activeReservations.length
            }
        };

        return handleSuccess(res, 200, 'Información detallada del usuario obtenida', userDetails);

    } catch (error) {
        console.error('Error en getUserDetailsForAssignment:', error);
        return handleErrorServer(res, 500, 'Error al obtener información del usuario', error.message);
    }
}