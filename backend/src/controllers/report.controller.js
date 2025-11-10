import { getWeeklyReportService } from "../services/report.service.js";
import { handleSuccess, handleErrorServer } from "../Handlers/responseHandlers.js";

export async function getWeeklyReport(req, res) {
    try {
        const report = await getWeeklyReportService();
        return handleSuccess(res, 200, "Reporte semanal generado", report);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}
