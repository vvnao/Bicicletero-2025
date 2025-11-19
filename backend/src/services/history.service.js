import { AppDataSource } from "../config/configDb.js";
import { HistoryEntity } from "../entities/HistoryEntity.js";

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
