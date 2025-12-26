import {
    getPendingUsers,
    approveUser,
    rejectUser,
    getReviewHistory 
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
};
