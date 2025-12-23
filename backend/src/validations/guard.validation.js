import Joi from 'joi';

export const validateCreateGuard = (data) => {
    const schema = Joi.object({
        userId: Joi.number().integer().required(),
        maxHoursPerWeek: Joi.number().integer().min(1).max(60).default(40),
        rating: Joi.number().min(0).max(5).precision(2).default(0),
        isAvailable: Joi.boolean().default(true)
    });

    return schema.validate(data, { abortEarly: false });
};

export const validateUpdateGuard = (data) => {
    const schema = Joi.object({
        maxHoursPerWeek: Joi.number().integer().min(1).max(60),
        rating: Joi.number().min(0).max(5).precision(2),
        isAvailable: Joi.boolean()
    }).min(1);

    return schema.validate(data, { abortEarly: false });
};