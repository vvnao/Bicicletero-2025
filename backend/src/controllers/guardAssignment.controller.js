import { AppDataSource } from "../config/configDb.js";
import { GuardAssignmentEntity } from "../entities/GuardAssignmentEntity.js";
import { UserEntity } from "../entities/UserEntity.js";
import { BikerackEntity } from "../entities/BikerackEntity.js";
import { GuardAssignmentService } from "../services/guardAssignment.service.js";

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
    console.log('🔍 Buscando asignaciones para bicicletero ID:', req.params.bikerackId);
    
    const { bikerackId } = req.params;
    const assignments = await this.guardAssignmentService.getAssignmentsByBikerack(bikerackId);
    
    console.log('✅ Asignaciones encontradas:', assignments);
    
    res.json({
      success: true,
      data: assignments
    });
    
  } catch (error) {
    console.error('❌ ERROR en getByBikerack:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: `Error al obtener asignaciones: ${error.message}`  // ← Muestra el error real
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
        async update(req, res) {
    try {
        const { assignmentId } = req.params;
        const updateData = req.body;
        
        const updated = await this.guardAssignmentService.updateAssignment(assignmentId, updateData);
        
        res.json({
        success: true,
        message: 'Asignación actualizada exitosamente',
        data: updated
        });
    } catch (error) {
        res.status(400).json({
        success: false,
        message: error.message
        });
    }
}
}

