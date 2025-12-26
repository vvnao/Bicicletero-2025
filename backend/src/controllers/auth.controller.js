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

        // 1. Hacer login (esto devuelve token y datos básicos)
        const data = await loginUser(email, password);
        
        // 2. Si el usuario es guardia, obtener su guardId
        if (data.user.role === 'guardia') {
            try {
                // Buscar el perfil de guardia asociado a este userId
                const guard = await guardService.getGuardByUserId(data.user.id);
                
                if (guard) {
                    // Agregar guardId a la respuesta
                    data.user.guardId = guard.id;
                    
                    // También podrías agregar más info del guardia si necesitas
                    data.user.guardInfo = {
                        phone: guard.phone,
                        isAvailable: guard.isAvailable,
                        rating: guard.rating
                    };
                }
            } catch (guardError) {
                console.warn(' No se pudo obtener info de guardia:', guardError.message);
                // No fallar el login si hay error obteniendo info de guardia
            }
        }

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

        for (const key in data) {
            if (data[key] === "" || data[key] === "null" || data[key] === "undefined") {
                data[key] = null;
            }
        }

        if (typeof data.bicycle === "string") {
            try {
                data.bicycle = JSON.parse(data.bicycle);
            } catch {
                return handleErrorClient(res, 400, "Formato inválido del campo 'bicycle'");
            }
        }

        if (req.files?.tnePhoto?.[0]) data.tnePhoto = req.files.tnePhoto[0].path;
        if (req.files?.photo?.[0]) data.bicycle.photo = req.files.photo[0].path;

        if (data.bicycle?.serialNumber != null) {
            data.bicycle.serialNumber = String(data.bicycle.serialNumber);
        }

        const { error: userError } = registerUserValidation.validate(data, { abortEarly: false });

        let bicycleError;
        if (data.bicycle && Object.keys(data.bicycle).length > 0 && data.bicycle.serialNumber) {
            const { error } = bicycleValidation.validate(data.bicycle, { abortEarly: false });
            bicycleError = error;
        }

        const mensajes = [
            ...(userError?.details.map(d => d.message) || []),
            ...(bicycleError?.details.map(d => d.message) || [])
        ];

        if (mensajes.length > 0) {
            console.log("Errores de validación:", userError, bicycleError);
            return handleErrorClient(res, 400, "Error de validación", mensajes);
        }

        const hasValidBicycle =
            data.bicycle &&
            Object.values(data.bicycle).some(
                v => v !== null && v !== "" && v !== undefined
            );

        if (!hasValidBicycle) {
            delete data.bicycle;
        }
        
        const newUser = await createUser(data);

        await sendEmail(
            newUser.email,
            "Solicitud de registro recibida - Bicicletero UBB",
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
