// src/services/report.service.js
import { MoreThan } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import { HistoryEntity } from "../entities/HistoryEntity.js";

export async function getWeeklyReportService() {
    const historyRepo = AppDataSource.getRepository(HistoryEntity);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const report = await historyRepo.find({
        where: { timestamp: MoreThan(oneWeekAgo) },
        relations: ["bicycle", "bikerack", "guard"],
        order: { timestamp: "DESC" },
    });

    return report;
}
