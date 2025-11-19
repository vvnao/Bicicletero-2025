import { getHistory } from "../services/history.service.js";
import { handleSuccess, handleErrorServer } from "../Handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import { HistoryEntity } from "../entities/HistoryEntity.js";

    export async function getHistoryController(req, res) {
        try {
            const filters = req.query || {};
            const history = await getHistory(filters);

            return handleSuccess(res, 200, "Historial obtenido exitosamente", history);
        } catch (error) {
            return handleErrorServer(res, 500, "Error al obtener historial", error.message);
        }
    }

    
    const historyRepo = AppDataSource.getRepository(HistoryEntity);
    
    export async function getHistory(filters = {}) {
        return await historyRepo.find({
        where: filters,
        relations: ["bicycle", "bikerack", "guard"],
        order: { timestamp: "DESC" },
        });
    }
    
    export async function createHistory(user, bicycle, bikerack, type) {
        const history = historyRepo.create({
            user,
            bicycle,
            bikerack,
            type,
            date: new Date(),
        });
    
        await historyRepo.save(history);
        return history;
        }
    