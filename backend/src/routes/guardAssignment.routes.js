// routes/guardAssignment.routes.js - CORREGIDO
import express from 'express';
// Cambia esto:
import { GuardAssignmentController } from '../controllers/guardAssignment.controller.js'; // ← .controller.js
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();
router.use(authMiddleware);

// CRUD básico
router.post('/', authorize(['admin']), (req, res) => new GuardAssignmentController().create(req, res));
router.get('/', authorize(['admin', 'guardia']), async (req, res) => {
    try {
        const assignments = await new GuardAssignmentController().guardAssignmentService.getAllActiveAssignments();
        res.json({ success: true, data: assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Por ID
router.get('/:id', authorize(['admin', 'guardia']), async (req, res) => {
    try {
        const assignment = await new GuardAssignmentController().guardAssignmentService.getAssignmentById(req.params.id);
        res.json({ success: true, data: assignment });
    } catch (error) {
        if (error.message.includes('no encontrad')) {
            res.status(404).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
});

router.put('/:id', authorize(['admin']), (req, res) => new GuardAssignmentController().update(req, res));
router.patch('/:id/deactivate', authorize(['admin']), (req, res) => new GuardAssignmentController().deactivate(req, res));

// Filtros específicos
router.get('/bikerack/:bikerackId', authorize(['admin', 'guardia']), (req, res) => new GuardAssignmentController().getByBikerack(req, res));
router.get('/guard/:guardId', authorize(['admin', 'guardia']), (req, res) => new GuardAssignmentController().getByGuard(req, res));

export default router;