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
    // GET usuarios pendientes
    async pending(req, res) {
        try {
            const users = await getPendingUsers();
            return handleSuccess(res, 200, "Solicitudes pendientes", users);
        } catch (error) {
            return handleErrorClient(res, 400, error.message);
        }
    },

    // POST aprobar usuario
    async approve(req, res) {
        try {
            const { id } = req.params;
            const guardId = req.user.sub;

            const user = await approveUser(id, guardId);
            return handleSuccess(res, 200, "Usuario aprobado", user);
        } catch (error) {
            return handleErrorClient(res, 400, error.message);
        }
    },

    // POST rechazar usuario
    async reject(req, res) {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            const guardId = req.user.sub;

            const user = await rejectUser(id, guardId, comment);
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
            const { id } = req.params;
            const result = await deleteReview(id);
            return handleSuccess(res, 200, result.message);
        } catch (error) {
            return handleErrorClient(res, 400, error.message);
        }
    },

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { newStatus, comment } = req.body;

            if (!["aprobado", "rechazado", "pendiente"].includes(newStatus)) {
                return handleErrorClient(res, 400, "Estado inválido");
            }

            const result = await updateUserStatusFromReview(id, newStatus, comment, req.user.sub);
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
