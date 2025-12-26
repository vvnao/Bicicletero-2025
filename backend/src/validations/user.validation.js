"use strict";
import Joi from "Joi";

export const registerUserValidation = Joi.object({
    names: Joi.string()
        .min(3)
        .max(50)
        .required()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/)
        .messages({
            "string.empty": "El nombre no puede estar vacío",
            "string.min": "El nombre debe tener al menos 3 caracteres",
            "any.required": "Debe ingresar su nombre",
            "string.pattern.base": "El nombre solo puede contener letras y espacios",
        }),

    lastName: Joi.string()
        .min(3)
        .max(50)
        .required()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/)
        .messages({
            "string.empty": "El apellido no puede estar vacío",
            "string.min": "El apellido debe tener al menos 3 caracteres",
            "any.required": "Debe ingresar su apellido",
            "string.pattern.base": "El apellido solo puede contener letras y espacios",
        }),

    rut: Joi.string()
        .pattern(/^\d{7,8}-[0-9kK]$/)
        .required()
        .messages({
            "string.pattern.base": "El RUT debe tener el formato 12345678-9",
            "any.required": "Debe ingresar su RUT",
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "Debe ingresar un correo válido",
            "any.required": "Debe ingresar su correo",
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.min": "La contraseña debe tener al menos 6 caracteres",
            "any.required": "Debe ingresar una contraseña",
        }),

    contact: Joi.string()
        .allow(null, "")
        .pattern(/^\+569\d{8}$/)
        .messages({
            "string.pattern.base":
                "El número de contacto debe tener el formato +569XXXXXXXX"
        }),

    // Tipo de persona
    typePerson: Joi.string()
        .valid("estudiante", "academico", "funcionario")
        .required()
        .messages({
            "any.required": "Debe seleccionar un tipo de persona",
        }),

    // Solo para estudiantes
    tnePhoto: Joi.string().allow(null, ""),

    // Solo para funcionarios
    position: Joi.string().allow(null, ""),
    positionDescription: Joi.string().allow(null, ""),

    // Bicicleta (opcional)
    bicycle: Joi.object({
        brand: Joi.string().optional().messages({
            "any.required": "Debe ingresar la marca de la bicicleta",
        }),
        model: Joi.string().optional().messages({
            "any.required": "Debe ingresar el modelo de la bicicleta",
        }),
        color: Joi.string().optional().messages({
            "any.required": "Debe ingresar el color de la bicicleta",
        }),
        serialNumber: Joi.string().allow(null, ""),
        description: Joi.string().allow(null, ""),
        photo: Joi.string().allow(null, ""), // bicyclePhoto
    }).optional(),
})
    .custom((value, helpers) => {
        const { typePerson, email, tnePhoto, position, positionDescription } = value;

        //Estudiante
        if (typePerson === "estudiante") {
            if (!/@alumnos\.ubiobio\.cl$/.test(email)) {
                return helpers.message(
                    "Los estudiantes deben usar un correo @alumnos.ubiobio.cl"
                );
            }
            if (!tnePhoto) {
                return helpers.message("Los estudiantes deben subir una foto de su TNE");
            }
        }

        // Académico
        if (typePerson === "academico") {
            if (!/@ubiobio\.cl$/.test(email)) {
                return helpers.message("Los académicos deben usar un correo institucional @ubiobio.cl");
            }
        }

        // Funcionario
        if (typePerson === "funcionario") {
            if (!position || !positionDescription) {
                return helpers.message("Los funcionarios deben ingresar su cargo y una descripción de su labor");
            }
        }
        return value;
    });

export const loginValidation = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "Debe ingresar un correo válido",
            "any.required": "Debe ingresar su correo",
        }),

    password: Joi.string()
        .required()
        .messages({
            "any.required": "Debe ingresar su contraseña",
        }),
});
