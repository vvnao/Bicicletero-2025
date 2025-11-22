import { AppDataSource } from "../config/configDb.js";
import { GuardAssignmentEntity } from "../entities/GuardAssignmentEntity.js";
import { UserEntity } from "../entities/UserEntity.js";
import { Bikerack } from "../entities/BikerackEntity.js";
import { GuardAssignmentService } from "../services/GuardAssignmentService.js";

export class GuardAssignmentController {
    constructor() {
        this.guardAssignmentService = new GuardAssignmentService();
    }

    async create(req, res) {
        try {
            const assignmentData = req.body;
            
            const assignment = await this.guardAssignmentService.createAssignment(assignmentData);
            
            res.status(201).json({
                success: true,
                message: 'Guardia asignado exitosamente',
                data: assignment
            });
            
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getByBikerack(req, res) {
        try {
            const { bikerackId } = req.params;
            const assignments = await this.guardAssignmentService.getAssignmentsByBikerack(bikerackId);
            
            res.json({
                success: true,
                data: assignments
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener asignaciones'
            });
        }
    }

    async getByGuard(req, res) {
        try {
            const { guardId } = req.params;
            const assignments = await this.guardAssignmentService.getAssignmentsByGuard(guardId);
            
            res.json({
                success: true,
                data: assignments
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener asignaciones del guardia'
            });
        }
    }

    async deactivate(req, res) {
        try {
            const { assignmentId } = req.params;
            await this.guardAssignmentService.deactivateAssignment(assignmentId);
            
            res.json({
                success: true,
                message: 'Asignación desactivada exitosamente'
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al desactivar asignación'
            });
        }
    }
}

