import { AppDataSource } from "../config/configDb.js";
import { HistoryEntity } from "../entities/HistoryEntity.js";

const historyRepo = AppDataSource.getRepository(HistoryEntity);

export async function getHistory(filters = {}) {
    return await historyRepo.find({
    where: filters,
    relations: ["bicycle", "bikeRack", "guard"],
    order: { timestamp: "DESC" },
    });
}
