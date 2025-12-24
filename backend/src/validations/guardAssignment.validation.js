// validations/guardAssignment.validation.js - NUEVO ARCHIVO
import Joi from 'joi';

export const validateCreateAssignment = (data) => {
    const schema = Joi.object({
        guardId: Joi.number().integer().positive().required(),
        bikerackId: Joi.number().integer().positive().required(),
        dayOfWeek: Joi.alternatives().try(
            Joi.string().valid('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'),
            Joi.number().integer().min(0).max(6)
        ).required(),
        startTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required()
            .messages({
                'string.pattern.base': 'Formato de hora inválido. Use HH:MM (24h)'
            }),
        endTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
             schedule: Joi.string().optional(), // Ej: "08:00-17:00"
        workDays: Joi.string().max(255).optional(), // Ej: "lunes,martes,miércoles"
        maxHoursPerWeek: Joi.number().integer().min(1).max(40).default(40),
        effectiveFrom: Joi.date().optional(),
        effectiveUntil: Joi.date().optional().allow(null),
        notes: Joi.string().max(500).optional()
    }).custom((value, helpers) => {
        // Validar que startTime < endTime
        const start = value.startTime;
        const end = value.endTime;
        
        const [startHours, startMinutes] = start.split(':').map(Number);
        const [endHours, endMinutes] = end.split(':').map(Number);
        
        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;
        
        if (startTotal >= endTotal) {
            return helpers.error('any.invalid', {
                message: 'La hora de inicio debe ser menor que la hora de fin'
            });
        }
        
        return value;
    });

    return schema.validate(data, { abortEarly: false });
};