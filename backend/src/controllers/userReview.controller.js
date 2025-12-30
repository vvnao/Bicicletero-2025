import {
    getPendingUsers,
    approveUser,
    rejectUser,
    getReviewHistory,
    deleteReview,
    updateUserStatusFromReview,
    getFilteredReviewHistory
} from "../services/userReview.service.js";
import { handleSuccess, handleErrorClient } from "../Handlers/responseHandlers.js";

export const UserReview = {

    async pending(req, res) {
        try {
            const users = await getPendingUsers();
            return handleSuccess(res, 200, "Solicitudes pendientes", users);
        } catch (error) {
            return handleErrorClient(res, 400, error.message);
        }
    },

    async approve(req, res) {
        try {
            const userId = Number(req.params.id);
            const guardId = Number(req.user.id);

            if (isNaN(userId) || isNaN(guardId)) {
                return handleErrorClient(res, 400, "ID inválido");
            }

            const user = await approveUser(userId, guardId);
            return handleSuccess(res, 200, "Usuario aprobado", user);
        } catch (error) {
            return handleErrorClient(res, 400, error.message);
        }
    },

    async reject(req, res) {
        try {
            const userId = Number(req.params.id);
            const guardId = Number(req.user.id);
            const { comment } = req.body;

            if (isNaN(userId) || isNaN(guardId)) {
                return handleErrorClient(res, 400, "ID inválido");
            }

            const user = await rejectUser(userId, guardId, comment);
            return handleSuccess(res, 200, "Usuario rechazado", user);
        } catch (error) {
            return handleErrorClient(res, 400, error.message);
        }
    },

    async history(req, res) {
        try {
            const history = await getReviewHistory();
            return handleSuccess(res, 200, "Historial de revisiones", history);
        } catch (error) {
            return handleErrorClient(res, 400, error.message);
        }
    },

    async delete(req, res) {
        try {
            const reviewId = Number(req.params.id);

            if (isNaN(reviewId)) {
                return handleErrorClient(res, 400, "ID inválido");
            }

            const result = await deleteReview(reviewId);
            return handleSuccess(res, 200, result.message);
        } catch (error) {
            return handleErrorClient(res, 400, error.message);
        }
    },

    async updateStatus(req, res) {
        try {
            const reviewId = Number(req.params.id);
            const guardId = Number(req.user.id);
            const { newStatus, comment } = req.body;

            if (isNaN(reviewId) || isNaN(guardId)) {
                return handleErrorClient(res, 400, "ID inválido");
            }

            if (!["aprobado", "rechazado", "pendiente"].includes(newStatus)) {
                return handleErrorClient(res, 400, "Estado inválido");
            }

            const result = await updateUserStatusFromReview(
                reviewId,
                newStatus,
                comment,
                guardId
            );

            return handleSuccess(res, 200, "Estado actualizado", result);
        } catch (error) {
            return handleErrorClient(res, 400, error.message);
        }
    },

    async filterByStatus(req, res) {
        try {
            const { action } = req.query;
            const history = await getFilteredReviewHistory(action);
            return handleSuccess(res, 200, "Historial filtrado", history);
        } catch (error) {
            return handleErrorClient(res, 400, error.message);
        }
    },
};
