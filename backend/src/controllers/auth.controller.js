import { loginUser } from "../services/auth.service.js";
import { createUser } from "../services/user.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        const { error } = userValidation.validate({ email, password });

        if (error) {
            const mensaje = error.details[0].message;
            return res.status(400).json({ message: mensaje });
        }

        if (!email || !password) {
            return handleErrorClient(res, 400, "Email y contraseña requeridos");
        }

        const data = await loginUser(email, password);
        handleSuccess(res, 200, "Login exitoso", data);
    } catch (error) {
        handleErrorClient(res, 401, error.message);
    }
}

export async function register(req, res) {
    try {
        const data = req.body;

        const { error } = userValidation.validate(data);

        if (error) {
            const mensaje = error.details[0].message;
            return res.status(400).json({ message: mensaje });
        }

        if (!data.email || !data.password) {
            return handleErrorClient(res, 400, "Email y contraseña requeridos");
        }

        const newUser = await createUser(data);
        delete newUser.password; // Nunca devolver la contraseña
        handleSuccess(res, 201, "Usuario registrado exitosamente", newUser);
    } catch (error) {
        if (error.code === '23505') { // Código de error de PostgreSQL para violación de unique constraint
            handleErrorClient(res, 409, "El email ya está registrado");
        } else {
            handleErrorServer(res, 500, "Error interno del servidor", error.message);
        }
    }
} 