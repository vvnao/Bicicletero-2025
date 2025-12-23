// dtos/CreateGuardAssignmentDto.js
export class CreateGuardAssignmentDto {
    constructor(data) {
        this.guardId = data.guardId;
        this.bikerackId = data.bikerackId;
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        this.daysOfWeek = data.daysOfWeek;
        this.startDate = data.startDate;
        this.endDate = data.endDate || null;
    }

    validate() {
        const errors = [];
        
        // Validaciones básicas
        if (!this.guardId) errors.push('El guardia es requerido');
        if (!this.bikerackId) errors.push('El bicicletero es requerido');
        if (!this.startTime) errors.push('La hora de inicio es requerida');
        if (!this.endTime) errors.push('La hora de fin es requerida');
        if (!this.daysOfWeek || this.daysOfWeek.length === 0) {
            errors.push('Debe seleccionar al menos un día');
        }
        if (!this.startDate) errors.push('La fecha de inicio es requerida');


        if (this.startTime && !this.isValidTime(this.startTime)) {
            errors.push('Formato de hora de inicio inválido (HH:MM)');
        }
        
        if (this.endTime && !this.isValidTime(this.endTime)) {
            errors.push('Formato de hora de fin inválido (HH:MM)');
        }

        // Validaciones de lógica de negocio
        if (this.startTime && this.endTime) {
            if (!this.isEndTimeAfterStartTime()) {
                errors.push('La hora de fin debe ser mayor a la hora de inicio');
            }
        }

        if (this.daysOfWeek && !this.areValidDays()) {
            errors.push('Días de la semana inválidos');
        }

        return errors;
    }

    isValidTime(time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    isEndTimeAfterStartTime() {
        const start = new Date(`2000-01-01T${this.startTime}`);
        const end = new Date(`2000-01-01T${this.endTime}`);
        return end > start;
    }

    areValidDays() {
        const validDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
        return this.daysOfWeek.every(day => validDays.includes(day));
    }

    toEntity() {
        return {
            guard: { id: this.guardId },
            bikerack: { id: this.bikerackId },
            startTime: this.startTime,
            endTime: this.endTime,
            daysOfWeek: this.daysOfWeek,
            startDate: this.startDate,
            endDate: this.endDate
        };
    }
}