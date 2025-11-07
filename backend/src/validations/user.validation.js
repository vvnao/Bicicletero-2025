"use strict"
import Joi from "Joi";

export const userValidation = Joi.object({
    role: Joi.string()
    .min(4)
    .max(7)
    .valid("admin", "guardia", "user")
    .required()
    .messages({
        'string.min':'El campo role no puede tener menos de 4 caracteres',
        'string.max':'El campo role no puede tener mas de 7 caracteres',
        "any.only": "El campo 'role' solo puede ser 'admin', 'guardia', 'user'.",
        "string.base": "El campo 'role' debe ser un texto.",
        "string.empty": "El campo 'role' no puede estar vacío.",
        "any.required": "El campo 'role' es obligatorio."
    }),
    names : Joi.string()
    .min(8)
    .max(30)
    .required()
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)
    .messages({
        "string.pattern.base": "El nombre solo puede contener letras y espacios",
        'string.min':'El nombre no pueden tener menos de 8 caracteres',
        'string.max': 'El nombre no pueden tener más de 30 caracteres',
        'string.empty': 'El nombre no puede quedar vacio',
        'any.required': 'El nombre es obligatorio'
    }),
    lastName : Joi.string()
    .min(8)
    .max(30)
    .required()
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)
    .messages({
        "string.pattern.base": "El apellido solo puede contener letras y espacios",
        'string.min':'El apellido no puede tener menos de 8 caracteres',
        'string.max': 'El apellido no pueden tener más de 30 caracteres',
        'string.empty': 'El apellido no puede quedar vacio',
        'any.required': 'El apellido es obligatorio'
    }),
    rut : Joi.string()
    .min(11)
    .max(12)
    .required()
    .pattern(/^\d{2}\.\d{3}\.\d{3}-[\dkK]$/)
    .messages({
        'string.empty': 'El rut no puede estar vacío.',
        'string.base': 'El rut debe ser de tipo string.',
        'string.min': 'El rut debe tener exactamente 10 caracteres.',
        'string.max': 'El rut debe tener exactamente 12 caracteres.',
        'string.pattern.base': 'Formato rut inválido. Debe ser xx.xxx.xxx-x.',
    }),
    email: Joi.string()
    .email({ tlds: { allow: false } }) 
    .pattern(/@(gmail\.com|ubiobio\.cl|alumnos\.ubiobio\.cl)$/)
    .required()
    .messages({
        'string.empty': "El correo electrónico es obligatorio",
        "string.email": "Debe ingresar un correo electrónico válido",
        "string.pattern.base":
        "Solo se permiten correos de los dominios @gmail.com, @ubiobio.cl o @alumnos.ubiobio.cl",
    }),
    password: Joi.string()
    .min(5)
    .max(20)
    .required()
    .messages({
        'string.min':'La contraseña no puede tener menos de 5 caracteres',
        'string.max': 'La contraseña no puede tener mas de 20 caracteres',
        'string.empty': 'La contraseña no puede quedar vacia',
        'any.required': 'La contraseña es obligatoria'
    }),
    contact : Joi.string()
    .pattern(/^\+?(\d{9,12})$/)
    .required()
    .messages({
        "string.empty": "El número de contacto es obligatorio",
        "string.pattern.base": "Debe ingresar un número válido (Ejemplo: +56987654321 o 987654321)",
    }),
    typePerson: Joi.string()
    .valid("estudiante", "academico", "funcionario")
    .when("role", {
    is: "user",
        then: Joi.required().messages({
        "any.only": "El campo 'typePerson' solo puede ser 'estudiante', 'académico' o 'funcionario'.",
        "string.base": "El campo 'typePerson' debe ser un texto.",
        "string.empty": "El campo 'typePerson' no puede estar vacío.",
        "any.required": "El campo 'typePerson' es obligatorio cuando el rol es 'user'."
        }),
        otherwise: Joi.optional()
    }),
    //*Por mientras comentado
    /*
    tnePhoto: Joi.string()
    .uri()
    .when("typePerson", {
        is: "estudiante",
        then: Joi.required().messages({
            "any.required": "La foto TNE es obligatoria para estudiantes.",
            "string.uri": "La foto TNE debe ser una URL válida."
        }),
        otherwise: Joi.optional()
    }),*/
    position: Joi.string()
    .when("typePerson", {
    is: "funcionario",
        then: Joi.required().messages({
            "any.required": "El campo 'position' es obligatorio para funcionarios."
        }),
        otherwise: Joi.optional()
    }),
    positionDescription: Joi.string()
    .when("typePerson", {
        is: "funcionario",
        then: Joi.required().messages({
            "any.required": "El campo 'positionDescription' es obligatorio para funcionarios."
        }),
        otherwise: Joi.optional()
    }),
    requestStatus:Joi.string()
    .min(8)
    .max(9)
    .valid("pendiente", "aprobado", "rechazado")
    .required()
    .messages({
        "string.min":"El campo 'requestStatus' debe tener minimo 8 caracteres.",
        "string.max":"El campo 'requestStatus' debe tener maximo 9 caracteres.",
        "any.only": "El campo 'requestStatus' solo puede ser 'pendiente', 'aprobado' o 'rechazado'.",
        "string.base": "El campo 'requestStatus' debe ser un texto.",
        "string.empty": "El campo 'requestStatus' no puede estar vacío.",
        "any.required": "El campo 'requestStatus' es obligatorio."
    }),
})

export const loginValidation = Joi.object({
    email: Joi.string()
    .email({ tlds: { allow: false } }) 
    .pattern(/@(gmail\.com|ubiobio\.cl|alumnos\.ubiobio\.cl)$/)
    .required()
    .messages({
        'string.empty': "El correo electrónico es obligatorio",
        "string.email": "Debe ingresar un correo electrónico válido",
        "string.pattern.base":
        "Solo se permiten correos de los dominios @gmail.com, @ubiobio.cl o @alumnos.ubiobio.cl",
    }),
    password: Joi.string()
    .min(5)
    .max(20)
    .required()
    .messages({
        'string.min':'La contraseña no puede tener menos de 5 caracteres',
        'string.max': 'La contraseña no puede tener mas de 20 caracteres',
        'string.empty': 'La contraseña no puede quedar vacia',
        'any.required': 'La contraseña es obligatoria'
    }),
});