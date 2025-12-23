import { Router } from 'express';
import { getUserRequestHistoryController } from '../controllers/userRequestHistory.controller.js';

const router = Router();

router.get('/', getUserRequestHistoryController);

export default router;