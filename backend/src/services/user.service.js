import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(UserEntity);
const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

export async function createUser(data) {
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear usuario con estado pendiente
    const newUser = userRepository.create({
        role: "user", // se fuerza por seguridad
        names: data.names,
        lastName: data.lastName,
        rut: data.rut,
        email: data.email,
        password: hashedPassword,
        contact: data.contact,
        typePerson: data.typePerson,
        tnePhoto: data.tnePhoto,
        position: data.position,
        positionDescription: data.positionDescription,
        requestStatus: "pendiente",
    });

    // Guardar usuario primero
    const savedUser = await userRepository.save(newUser);

    // Si vienen datos de bicicleta, crear y vincular
    if (data.bicycle) {
        const { brand, model, color, serialNumber, photo } = data.bicycle;

        const newBicycle = bicycleRepository.create({
            brand,
            model,
            color,
            serialNumber,
            photo,
            user: savedUser,
        });

        await bicycleRepository.save(newBicycle);
    }

    return savedUser;
}

export async function findUserByEmail(email) {
    return await userRepository.findOne({
        where: { email },
        relations: ["bicycles"], // incluir bicicletas si las tiene
    });
}
async function getAssignableUsers(filters = {}) {
    try {
        const query = this.userRepository.createQueryBuilder('user')
            .select([
                'user.id',
                'user.names',
                'user.lastName',
                'user.email',
                'user.rut',
                'user.role',
                'user.isActive',
                'user.typePerson'
            ])
            .where('user.isActive = :isActive', { isActive: true })
            .andWhere('user.role != :adminRole', { adminRole: 'admin' }) // Excluir admins
            .leftJoinAndSelect('user.guard', 'guard') // Para saber si ya es guardia
            .orderBy('user.names', 'ASC');

        if (filters.search) {
            query.andWhere(
                '(user.names LIKE :search OR user.lastName LIKE :search OR user.rut LIKE :search OR user.email LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        if (filters.role) {
            query.andWhere('user.role = :role', { role: filters.role });
        }

        if (filters.typePerson) {
            query.andWhere('user.typePerson = :typePerson', { typePerson: filters.typePerson });
        }

        const users = await query.getMany();

        // Formatear respuesta
        return users.map(user => ({
            id: user.id,
            names: user.names,
            lastName: user.lastName,
            fullName: `${user.names} ${user.lastName}`,
            email: user.email,
            rut: user.rut,
            role: user.role,
            typePerson: user.typePerson,
            isAlreadyGuard: !!user.guard, // Importante: saber si ya es guardia
            guardInfo: user.guard ? {
                id: user.guard.id,
                isAvailable: user.guard.isAvailable,
                rating: user.guard.rating
            } : null,
            canBeAssigned: user.role !== 'admin' && !user.guard
        }));
    } catch (error) {
        console.error('Error en getAssignableUsers:', error);
        throw error;
    }
}