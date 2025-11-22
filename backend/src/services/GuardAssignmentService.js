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

}