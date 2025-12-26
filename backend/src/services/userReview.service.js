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

// GUARD/ADMIN — eliminar revisión del historial
export async function deleteReview(reviewId) {
    const review = await reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) throw new Error("Revisión no encontrada");
    await reviewRepository.delete(reviewId);
    return { message: "Revisión eliminada correctamente" };
}

// GUARD/ADMIN — cambiar estado del usuario + corregir acción en el historial
export async function updateUserStatusFromReview(reviewId, newStatus, comment, guardId) {
    const review = await reviewRepository.findOne({
        where: { id: reviewId },
        relations: ["user", "guard"]
    });

    if (!review) throw new Error("Revisión no encontrada");

    const user = review.user;
    if (!user) throw new Error("Usuario asociado no encontrado");

    user.requestStatus = newStatus;
    await userRepository.save(user);

    review.action = newStatus;
    if (newStatus === "rechazado") {
        review.comment = comment || "Sin comentario";

        await sendEmail(
            user.email,
            "Solicitud rechazada",
            emailTemplates.requestRejected(user, review.comment)
        );
    }

    if (newStatus === "aprobado") {
        await sendEmail(
            user.email,
            "Solicitud aprobada",
            emailTemplates.requestApproved(user)
        );
    }

    await reviewRepository.save(review);
    return { user, review };
}

// ADMIN/GUARD — filtrar historial por estado
export async function getFilteredReviewHistory(action) {
    return await reviewRepository.find({
        where: { action },
        relations: ["user", "guard"],
        order: { created_at: "DESC" }
    });
}

