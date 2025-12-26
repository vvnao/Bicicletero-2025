import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import { UserReviewEntity } from "../entities/UserReviewEntity.js";
import { sendEmail } from "./email.service.js";
import { emailTemplates } from "../templates/userRequestEmail.template.js";

const userRepository = AppDataSource.getRepository(UserEntity);
const reviewRepository = AppDataSource.getRepository(UserReviewEntity);

// GUARDIA — ver usuarios pendientes
export async function getPendingUsers() {
    return await userRepository.find({
        where: { requestStatus: "pendiente" },
        relations: ["bicycles"],
    });
}

// GUARDIA — aprobar usuario
export async function approveUser(userId, guardId) {

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error("Usuario no encontrado");

    user.requestStatus = "aprobado";
    await userRepository.save(user);

    const review = reviewRepository.create({
        user: { id: Number(userId) },
        guard: { id: Number(guardId) },
        action: "aprobado",
    });
    await reviewRepository.save(review);

    await sendEmail(
        user.email,
        "Solicitud aprobada",
        emailTemplates.requestApproved(user)
    );

    return user;
}

// GUARDIA — rechazar usuario
export async function rejectUser(userId, guardId, comment) {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error("Usuario no encontrado");

    user.requestStatus = "rechazado";
    await userRepository.save(user);

    const review = reviewRepository.create({
        user: { id: Number(userId) },
        guard: { id: Number(guardId) },
        action: "rechazado",
        comment,
    });
    await reviewRepository.save(review);

    await sendEmail(
        user.email,
        "Solicitud rechazada",
        emailTemplates.requestRejected(user, comment)
    );

    return user;
}

// ADMIN — historial completo
export async function getReviewHistory() {
    return await reviewRepository.find({
        relations: ["user", "guard"],
        order: { created_at: "DESC" },
    });
}
