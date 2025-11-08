"use strict";
import Joi from "Joi";

export const bicycleValidation = Joi.object ({
    brand: Joi.string()
    .min(3)
    .max(40)
    .required()
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóú1-9 ]+$/)
    .messages({
        "string.min":"La marca debe tener al menos 3 caracteres",
        "string.max": "La marca debe tener máximo 40 caracteres",
        "any.required": "La marca de la bicicleta es obligatoria",
        "string.empty": "La marca no puede estar vacía",
        "string.pattern": "La marca sólo puede contener letras de la A-Z, números y espacio"
    }),
    model: Joi.string()
    .min(3)
    .max(40)
    .required()
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóú1-9 ]+$/)
    .messages({
        "string.min":"El modelo debe tener al menos 3 caracteres",
        "string.max": "El modelo debe tener máximo 40 caracteres",
        "any.required": "El modelo de la bicicleta es obligatoria",
        "string.empty": "El modelo no puede estar vacío",
        "string.pattern": "El modelo sólo puede contener letras de la A-Z, números y espacio"
    }),
    color: Joi.string()
    .min(3)
    .max(40)
    .required()
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóú ]+$/)
    .messages({
        "string.min":"El color debe tener al menos 3 caracteres",
        "string.max": "El color debe tener máximo 40 caracteres",
        "any.required": "El color de la bicicleta es obligatoria",
        "string.empty": "El color no puede estar vacía",
        "string.pattern": "El color sólo puede contener letras de la A-Z y espacio"
    }),
    serialNumber: Joi.number()
    .required()
    .messages({
        "any.required":"El número de serie es obligatorio",
        "string.empty":"El número de serie no puede estar vacío",
    }),
    photo: Joi.string()
    .uri()
    .messages({
        "string.uri":"La foto de la bicicleta debe ser una URL válida"
    }),
})
