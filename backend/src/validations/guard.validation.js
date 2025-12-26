
import Joi from 'joi';

export const validateCreateGuard = (data) => {
    const schema = Joi.object({
        // Datos personales OBLIGATORIOS
        names: Joi.string().min(2).max(100).required(),
        lastName: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        rut: Joi.string().pattern(/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/).optional(),
        
        // Contraseña (opcional - si no viene, se genera temporal)
        password: Joi.string().min(6).optional(),
        
        // Otros campos
        typePerson: Joi.string().valid('funcionario', 'estudiante', 'externo').default('funcionario'),
        phone: Joi.string().pattern(/^[+]?[0-9\s\-()]+$/).max(20).optional(),
        address: Joi.string().max(500).optional(),
        emergencyContact: Joi.string().max(255).optional(),
        emergencyPhone: Joi.string().pattern(/^[+]?[0-9\s\-()]+$/).max(20).optional(),
        schedule: Joi.string().max(100).optional(),
        workDays: Joi.string().max(255).optional(),
        maxHoursPerWeek: Joi.number().integer().min(1).max(40).optional(),
        isAvailable: Joi.boolean().optional()
    });

    return schema.validate(data, { abortEarly: false });
};

export const validateUpdateGuard = (data) => {
    const schema = Joi.object({
        // Campos editables por admin y guardia
        phone: Joi.string().pattern(/^[+]?[0-9\s\-()]+$/).max(20).optional(),
        address: Joi.string().max(500).optional(),
        schedule: Joi.string().max(100).optional(),
        workDays: Joi.string().max(255).optional(),
        
        // Campos editables solo por admin
        names: Joi.string().min(2).max(100).optional(),
        lastName: Joi.string().min(2).max(100).optional(),
        email: Joi.string().email().optional(),
        emergencyContact: Joi.string().max(255).optional(),
        emergencyPhone: Joi.string().pattern(/^[+]?[0-9\s\-()]+$/).max(20).optional(),
        maxHoursPerWeek: Joi.number().integer().min(1).max(40).optional(),
        rating: Joi.number().min(0).max(5).precision(2).optional(),
        isAvailable: Joi.boolean().optional()
    }).min(1);

    return schema.validate(data, { abortEarly: false });
};