import { DashboardService } from '../services/dashboard.service.js';

export async function getDashboardData(req, res) {
    try {
        const metrics = await DashboardService.getMetrics();
        const assignments = await DashboardService.getGuardAssignments();
        
        res.status(200).json({
            success: true,
            data: {
                ...metrics,
                assignments
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error al cargar el dashboard" });
    }
}