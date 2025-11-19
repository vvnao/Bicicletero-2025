import { getUserRequestHistory } from "../services/userRequestHistory.service.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../Handlers/responseHandlers.js";

export async function getUserRequestHistoryController(req, res) {
  try {
    const filters = req.query || {};
   
    const allowedFilters = {};
    if (filters.userId) allowedFilters.user = { id: parseInt(filters.userId) };
    if (filters.newStatus) allowedFilters.newStatus = filters.newStatus;
    if (filters.reviewedById) allowedFilters.reviewedBy = { id: parseInt(filters.reviewedById) };

    const history = await getUserRequestHistory(allowedFilters);
    return handleSuccess(res, 200, "Historial de solicitudes obtenido exitosamente", history);
  } catch (error) {
    return handleErrorServer(res, 500, "Error al obtener historial de solicitudes", error.message);
  }
}