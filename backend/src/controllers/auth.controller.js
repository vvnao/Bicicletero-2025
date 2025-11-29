import { loginUser } from "../services/auth.service.js";
import { createUser } from "../services/user.service.js";
import { handleSuccess, handleErrorClient } from "../Handlers/responseHandlers.js";
import { sendEmail } from "../services/email.service.js";
import { registerUserValidation, loginValidation } from "../validations/user.validation.js";
import { registrationEmailTemplate } from "../templates/emailTemplate.js";
import { bicycleValidation } from "../validations/bicycle.validation.js";

// LOGIN
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const { error } = loginValidation.validate({ email, password });

        if (error) {
            const mensaje = error.details[0].message;
            return handleErrorClient(res, 400, mensaje);
        }
        if (!email || !password) {
            return handleErrorClient(res, 400, "Email y contraseña requeridos");
        }

        const data = await loginUser(email, password);
        return handleSuccess(res, 200, "Inicio de sesión exitoso", data);
    } catch (error) {
        return handleErrorClient(res, 401, error.message);
    }
}
// REGISTRO
export async function register(req, res) {
    try {
        let data = { ...req.body };

        console.log("FILES RECIBIDOS:", req.files);
        console.log("BODY:", req.body);

        // Limpiar valores vacíos
        for (const key in data) {
            if (data[key] === "" || data[key] === "null" || data[key] === "undefined") {
                data[key] = null;
            }
        }

        // Parsear la bicicleta si viene como string
        if (typeof data.bicycle === "string") {
            try {
                data.bicycle = JSON.parse(data.bicycle);
            } catch {
                return handleErrorClient(res, 400, "Formato inválido del campo 'bicycle'");
            }
        }

        // Si no hay bicicleta, crear objeto vacío
        if (!data.bicycle) data.bicycle = {};

        // Incorporar rutas de archivos
        if (req.files?.tnePhoto?.[0]) data.tnePhoto = req.files.tnePhoto[0].path;
        if (req.files?.photo?.[0]) data.bicycle.photo = req.files.photo[0].path;

        // Forzar serialNumber a string si existe
        if (data.bicycle?.serialNumber != null) {
            data.bicycle.serialNumber = String(data.bicycle.serialNumber);
        }

        // Validar datos del usuario
        const { error: userError } = registerUserValidation.validate(data, { abortEarly: false });

        // Validar datos de la bicicleta solo si tiene propiedades y serialNumber
        let bicycleError;
        if (data.bicycle && Object.keys(data.bicycle).length > 0 && data.bicycle.serialNumber) {
            const { error } = bicycleValidation.validate(data.bicycle, { abortEarly: false });
            bicycleError = error;
        }

        // Unir errores
        const mensajes = [
            ...(userError?.details.map(d => d.message) || []),
            ...(bicycleError?.details.map(d => d.message) || [])
        ];

        if (mensajes.length > 0) {
    console.log("Errores de validación:", userError, bicycleError);
    return handleErrorClient(res, 400, "Error de validación", mensajes);
}


        // Crear usuario (las validaciones de dominio se hacen en el servicio)
        const newUser = await createUser(data);

        // Enviar correo de confirmación
        await sendEmail(
            newUser.email,
            "Solicitud de registro recibida - Bicicletero UBB",
            `Hola ${newUser.names}, tu solicitud fue recibida.`,
            registrationEmailTemplate(newUser.names)
        );

        // Respuesta sin password
        delete newUser.password;
        return handleSuccess(res, 201, "Usuario registrado exitosamente. Espera aprobación.", newUser);

    } catch (error) {
        console.error("Error en register:", error);
        if (error.code === "23505" || error.message.includes('ya está registrado')) {
            return handleErrorClient(res, 409, error.message);
        }
        return handleErrorClient(res, 400, error.message);
    }
}
