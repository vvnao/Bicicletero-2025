import { getHistory } from "../services/history.service.js";
import { handleSuccess, handleErrorServer } from "../Handlers/responseHandlers.js";

    export async function getHistoryController(req, res) {
        try {
            const filters = req.query || {};
            const history = await getHistory(filters);

            return handleSuccess(res, 200, "Historial obtenido exitosamente", history);
        } catch (error) {
            return handleErrorServer(res, 500, "Error al obtener historial", error.message);
        }
    }
