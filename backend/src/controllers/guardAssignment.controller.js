// controllers/GuardAssignmentController.js
import { GuardAssignmentService } from "../services/guardAssignment.service.js";

export class GuardAssignmentController {
    constructor() {
        this.guardAssignmentService = new GuardAssignmentService();
    }

    async create(req, res) {
        try {
            const assignment = await this.guardAssignmentService.createAssignment(req.body);
            res.status(201).json({ success: true, message: 'Asignación creada', data: assignment });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getByBikerack(req, res) {
        try {
            const assignments = await this.guardAssignmentService.getAssignmentsByBikerack(req.params.bikerackId);
            res.json({ success: true, data: assignments });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByGuard(req, res) {
        try {
            const assignments = await this.guardAssignmentService.getAssignmentsByGuard(req.params.guardId);
            res.json({ success: true, data: assignments });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const updated = await this.guardAssignmentService.updateAssignment(req.params.id, req.body);
            res.json({ success: true, message: 'Actualizado', data: updated });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deactivate(req, res) {
        try {
            await this.guardAssignmentService.deactivateAssignment(req.params.id);
            res.json({ success: true, message: 'Desactivado' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}