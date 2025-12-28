import { Router } from 'express';
import { 
    generateWeeklyReportController, 
    getReportsHistoryController,
    generateAuditReportController 
} from '../controllers/reports.controller.js';

const router = Router();

// Usa los nombres exactos que definiste con la palabra "Controller" al final
router.post('/generate', generateWeeklyReportController);
router.get('/history', getReportsHistoryController);
router.get('/audit', generateAuditReportController);

export default router;