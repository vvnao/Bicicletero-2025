"use strict";
import Joi from "joi";

export const bicycleValidation = Joi.object({
    brand: Joi.string()
        .min(3)
        .max(40)
        .required()
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóú0-9 ]+$/)
        .messages({
            "string.min": "La marca debe tener al menos 3 caracteres",
            "string.max": "La marca debe tener máximo 40 caracteres",
            "any.required": "La marca de la bicicleta es obligatoria",
            "string.pattern.base": "La marca solo puede contener letras, números y espacios"
        }),
    model: Joi.string()
        .min(3)
        .max(40)
        .required()
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóú0-9 ]+$/)
        .messages({
            "string.min": "El modelo debe tener al menos 3 caracteres",
            "string.max": "El modelo debe tener máximo 40 caracteres",
            "any.required": "El modelo de la bicicleta es obligatorio",
            "string.pattern.base": "El modelo solo puede contener letras, números y espacios"
        }),
    color: Joi.string()
        .min(3)
        .max(40)
        .required()
        .pattern(/^[A-Za-zÁÉÍÓÚáéíóú ]+$/)
        .messages({
            "string.min": "El color debe tener al menos 3 caracteres",
            "string.max": "El color debe tener máximo 40 caracteres",
            "any.required": "El color de la bicicleta es obligatorio",
            "string.pattern.base": "El color solo puede contener letras y espacios"
        }),
    serialNumber: Joi.string()
    .pattern(/^[0-9]{1,6}$/)
    .required()
    .messages({
        "string.pattern.base": "El número de serie debe contener solo números y máximo 6 dígitos",
        "any.required": "El número de serie es obligatorio",
        "string.empty": "El número de serie no puede estar vacío"
    }),

    photo: Joi.string()
        .uri()
        .messages({
            "string.uri": "La foto de la bicicleta debe ser una URL válida"
        }),
}).unknown(true); 