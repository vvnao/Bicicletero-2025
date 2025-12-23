// dtos/CreateGuardAssignmentDto.js - EJEMPLO CORREGIDO
export class CreateGuardAssignmentDto {
    constructor(data) {
        this.guardId = data.guardId;
        this.bikerackId = data.bikerackId;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.startTime = data.startTime;  // Debería aceptar HH:MM o HH:MM:SS
        this.endTime = data.endTime;      // Debería aceptar HH:MM o HH:MM:SS
        this.daysOfWeek = data.daysOfWeek || [];
        this.status = data.status || 'activo';
    }

    validate() {
        const errors = [];
        
        if (!this.guardId) errors.push('ID de guardia requerido');
        if (!this.bikerackId) errors.push('ID de bicicletero requerido');
        
        // Validar fechas
        const startDate = new Date(this.startDate);
        const endDate = new Date(this.endDate);
        if (isNaN(startDate.getTime())) errors.push('Fecha de inicio inválida');
        if (isNaN(endDate.getTime())) errors.push('Fecha de fin inválida');
        if (startDate > endDate) errors.push('Fecha de inicio debe ser anterior a fecha de fin');
        
        // Validar horas - Aceptar tanto HH:MM como HH:MM:SS
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        
        if (!timeRegex.test(this.startTime)) {
            errors.push('Formato de hora de inicio inválido (HH:MM o HH:MM:SS)');
        }
        
        if (!timeRegex.test(this.endTime)) {
            errors.push('Formato de hora de fin inválido (HH:MM o HH:MM:SS)');
        }
        
        // Validar días de la semana
        const validDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        if (this.daysOfWeek && this.daysOfWeek.length > 0) {
            this.daysOfWeek.forEach(day => {
                if (!validDays.includes(day)) {
                    errors.push(`Día inválido: ${day}`);
                }
            });
        }
        
        return errors;
    }

    toEntity() {
        return {
            guard: { id: this.guardId },
            bikerack: { id: this.bikerackId },
            startDate: this.startDate,
            endDate: this.endDate,
            startTime: this.startTime,
            endTime: this.endTime,
            daysOfWeek: this.daysOfWeek,
            status: this.status,
            assignedAt: new Date()
        };
    }
}