import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";
import historyService from "./history.service.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(UserEntity);
const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

export async function createUser(data) {

    const existingUser = await userRepository.findOne({
        where: [
            { email: data.email },
            { rut: data.rut }
        ],
        relations: ["bicycles"]
    });

    if (existingUser && existingUser.requestStatus !== "rechazado") {
        throw new Error("Este usuario ya está registrado.");
    }

    if (existingUser && existingUser.requestStatus === "rechazado") {

        Object.assign(existingUser, {
            names: data.names,
            lastName: data.lastName,
            rut: data.rut,
            email: data.email,
            contact: data.contact,
            typePerson: data.typePerson,
            tnePhoto: data.tnePhoto,
            position: data.position,
            positionDescription: data.positionDescription,
            requestStatus: "pendiente",
            password: data.password
                ? await bcrypt.hash(data.password, 10)
                : existingUser.password,
        });

        const updated = await userRepository.save(existingUser);

        const reloaded = await userRepository.findOne({
            where: { id: updated.id },
        });

        await bicycleRepository.delete({ user: { id: reloaded.id } });

        if (data.bicycle) {
            const newBicycle = bicycleRepository.create({
                ...data.bicycle,
                user: reloaded,
            });

            await bicycleRepository.save(newBicycle);
        }

        return reloaded;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = userRepository.create({
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
        role: "user",
        requestStatus: "pendiente",
    });

    const savedUser = await userRepository.save(newUser);


    await historyService.logEvent({
        type: "user_register",
        description: `Nuevo usuario registrado: ${savedUser.names} ${savedUser.lastName}`,
        userId: savedUser.id,
        details: { email: savedUser.email, role: savedUser.role }
    });

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

        const savedBicycle = await bicycleRepository.save(newBicycle);

        await historyService.logEvent({
            type: "bicycle_register",
            description: `Bicicleta ${brand} ${model} registrada para ${savedUser.email}`,
            userId: savedUser.id,
            bicycleId: savedBicycle.id,
            details: { serialNumber }
        });
    }

    return savedUser;
}

export async function findUserByEmail(email) {
    return await userRepository.findOne({
        where: { email },
        relations: ["bicycles"],
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
            .andWhere('user.role != :adminRole', { adminRole: 'admin' })
            .leftJoinAndSelect('user.guard', 'guard')
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

        return users.map(user => ({
            id: user.id,
            names: user.names,
            lastName: user.lastName,
            fullName: `${user.names} ${user.lastName}`,
            email: user.email,
            rut: user.rut,
            role: user.role,
            typePerson: user.typePerson,
            isAlreadyGuard: !!user.guard,
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