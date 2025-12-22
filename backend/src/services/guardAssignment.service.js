// services/GuardAssignmentService.js
import { AppDataSource } from "../config/configDb.js";
import { GuardAssignmentEntity } from "../entities/GuardAssignmentEntity.js";
import { CreateGuardAssignmentDto } from "../dtos/CreateGuardAssingmentDto.js";

export class GuardAssignmentService {
    constructor() {
        this.guardAssignmentRepository = AppDataSource.getRepository(GuardAssignmentEntity);
    }

    async createAssignment(assignmentData) {
        // 1. Crear DTO y validar
        const dto = new CreateGuardAssignmentDto(assignmentData);
        const errors = dto.validate();
        
        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.join(', ')}`);
        }

        // 2. Verificar conflictos de horario
        const existingAssignment = await this.checkScheduleConflict(
            dto.guardId,
            dto.bikerackId,
            dto.startTime,
            dto.endTime,
            dto.daysOfWeek
        );

        if (existingAssignment) {
            throw new Error('El guardia ya tiene una asignación en este horario');
        }

        // 3. Convertir DTO a Entidad y guardar
        const assignment = this.guardAssignmentRepository.create(dto.toEntity());
        return await this.guardAssignmentRepository.save(assignment);
    }

    async checkScheduleConflict(guardId, bikerackId, startTime, endTime, daysOfWeek) {
        // Misma lógica que antes...
    }

    async updateAssignment(assignmentId, updateData) {
        // 1. Buscar asignación existente
        const assignment = await this.guardAssignmentRepository.findOne({
            where: { id: assignmentId },
            relations: ['guard', 'bikerack']
        });
        
        if (!assignment) {
            throw new Error('Asignación no encontrada');
        }
        
        // 2. Validar datos de actualización
        // (podrías crear un UpdateGuardAssignmentDto)
        
        // 3. Actualizar campos
        Object.assign(assignment, updateData);
        
        // 4. Guardar cambios
        return await this.guardAssignmentRepository.save(assignment);
        }

       async getAssignmentsByBikerack(bikerackId) {
  try {
    console.log(`📋 Buscando asignaciones para bicicletero ID: ${bikerackId}`);
    
    const assignments = await this.guardAssignmentRepository.find({
      where: { 
        bikerack: { id: parseInt(bikerackId) }
      },
      relations: ["guard", "bikerack"],
      order: { assignedAt: "DESC" }  // Cambié de created_at a assignedAt
    });
    
    console.log(`✅ Encontradas ${assignments.length} asignaciones`);
    
    // DEBUG: Ver la primera asignación para ver su estructura
    if (assignments.length > 0) {
      console.log('🔍 Estructura de la primera asignación:', assignments[0]);
      console.log('🔍 Propiedades disponibles:', Object.keys(assignments[0]));
    }
    
    // Mapeo adaptado a EntitySchema
    return assignments.map(assignment => {
      // IMPORTANTE: Con EntitySchema, accede a las propiedades directamente
      // TypeORM ya hizo el mapeo de nombres de columna a propiedades
      return {
        id: assignment.id,
        guard: assignment.guard ? {
          id: assignment.guard.id,
          name: `${assignment.guard.names || ''} ${assignment.guard.lastName || ''}`.trim(),
          email: assignment.guard.email
        } : null,
        bikerack: assignment.bikerack ? {
          id: assignment.bikerack.id,
          name: assignment.bikerack.name
        } : null,
        schedule: {
          // Accede a las propiedades DIRECTAMENTE como las definiste
          startDate: assignment.startDate,  // Así como está en tu EntitySchema
          endDate: assignment.endDate,      // Así como está en tu EntitySchema
          startTime: assignment.startTime,  // Así como está en tu EntitySchema
          endTime: assignment.endTime,      // Así como está en tu EntitySchema
          daysOfWeek: assignment.daysOfWeek || []  // Así como está en tu EntitySchema
        },
        status: assignment.status || 'activo',
        assignedAt: assignment.assignedAt,
        // Nota: Con EntitySchema no tienes created_at/updated_at automáticos
        // a menos que los definas explícitamente
      };
    });
    
  } catch (error) {
    console.error('❌ Error en getAssignmentsByBikerack:', error);
    throw new Error(`Error al obtener asignaciones del bicicletero: ${error.message}`);
  }
}

    async getAssignmentsByGuard(guardId) {
        try {
            console.log(`📋 Buscando asignaciones para guardia ID: ${guardId}`);
            
            const assignments = await this.guardAssignmentRepository.find({
                where: { 
                    guard: { id: parseInt(guardId) }
                },
                relations: ["guard", "bikerack"],
                order: { startDate: "DESC" }
            });
            
            console.log(`✅ Encontradas ${assignments.length} asignaciones para el guardia`);
            
            return assignments.map(assignment => ({
                id: assignment.id,
                guard: {
                    id: assignment.guard.id,
                    name: `${assignment.guard.names || ''} ${assignment.guard.lastName || ''}`.trim()
                },
                bikerack: {
                    id: assignment.bikerack.id,
                    name: assignment.bikerack.name,
                    location: assignment.bikerack.location
                },
                schedule: {
                    startDate: assignment.startDate,
                    endDate: assignment.endDate,
                    startTime: assignment.startTime,
                    endTime: assignment.endTime,
                    daysOfWeek: assignment.daysOfWeek || []
                },
                status: assignment.status || 'activo'
            }));
            
        } catch (error) {
            console.error('❌ Error en getAssignmentsByGuard:', error);
            throw new Error(`Error al obtener asignaciones del guardia: ${error.message}`);
        }
    }

    async deactivateAssignment(assignmentId) {
        try {
            console.log(`🔴 Desactivando asignación ID: ${assignmentId}`);
            
            const assignment = await this.guardAssignmentRepository.findOne({
                where: { id: parseInt(assignmentId) }
            });
            
            if (!assignment) {
                throw new Error('Asignación no encontrada');
            }
            
            assignment.status = 'inactivo';
            assignment.updated_at = new Date();
            
            await this.guardAssignmentRepository.save(assignment);
            
            console.log(`✅ Asignación ${assignmentId} desactivada correctamente`);
            return { message: 'Asignación desactivada exitosamente' };
            
        } catch (error) {
            console.error('❌ Error en deactivateAssignment:', error);
            throw new Error(`Error al desactivar asignación: ${error.message}`);
        }
    }

    // En la misma clase GuardAssignmentService
async getAssignmentById(assignmentId) {
    try {
        const assignment = await this.guardAssignmentRepository.findOne({
            where: { id: parseInt(assignmentId) },
            relations: ["guard", "bikerack"]
        });
        
        if (!assignment) {
            throw new Error('Asignación no encontrada');
        }
        
        return assignment;
    } catch (error) {
        console.error('Error en getAssignmentById:', error);
        throw error;
    }
}

async getAllActiveAssignments() {
    try {
        return await this.guardAssignmentRepository.find({
            where: { status: 'activo' },
            relations: ["guard", "bikerack"],
            order: { startDate: "ASC" }
        });
    } catch (error) {
        console.error('Error en getAllActiveAssignments:', error);
        throw error;
    }
}

}