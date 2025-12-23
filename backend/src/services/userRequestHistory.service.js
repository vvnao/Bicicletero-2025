import { AppDataSource } from "../config/configDb.js";
import { UserRequestHistoryEntity } from "../entities/UserRequestHistoryEntity.js";

const userRequestHistoryRepo = AppDataSource.getRepository(UserRequestHistoryEntity);

export async function getUserRequestHistory(filters = {}) {
    try {
        return await userRequestHistoryRepo.find({
        where: filters,
        relations: ["user", "reviewedBy"],
        order: { timestamp: "DESC" },
        });
    } catch (error) {
        throw new Error(`Error al obtener historial de solicitudes: ${error.message}`);
    }
    }

    export async function logUserRequestChange(userId, previousStatus, newStatus, reviewedById = null, comments = null) {
    try {
        const history = userRequestHistoryRepo.create({
        user: { id: userId },
        reviewedBy: reviewedById ? { id: reviewedById } : null,
        previousStatus: previousStatus,
        newStatus: newStatus,
        comments: comments,
        });

        await userRequestHistoryRepo.save(history);
        return history;
    } catch (error) {
        throw new Error(`Error al crear historial de solicitud: ${error.message}`);
    }
    }

    export async function logInitialRegistration(userId) {
    return await logUserRequestChange(
        userId,
        null,
        'pendiente',
        null,
        'Usuario realizó solicitud de registro'
    );
    }

    export async function logRequestReview(userId, reviewedById, previousStatus, newStatus, comments = null) {
    return await logUserRequestChange(
        userId,
        previousStatus,
        newStatus,
        reviewedById,
        comments || `Solicitud ${newStatus} por administrador`
    );
}