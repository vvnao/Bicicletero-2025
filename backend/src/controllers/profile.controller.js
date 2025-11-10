import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { UserEntity } from "../entities/UserEntity.js";
import { AppDataSource } from "../config/configDb.js";
import bcrypt from "bcrypt";

export async function getPrivateProfile(req, res) {
    try{
        const userRepository = AppDataSource.getRepository(UserEntity);
        const userId = req.user.sub;
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) return handleErrorClient(res, 404, "Usuario no encontrado");
        handleSuccess(res, 200, "Perfil privado obtenido exitosamente", {
            userData: user,
        });
    }catch (error) {
        handleErrorServer(res,500,"Error del servidor",error);
    }
}
export async function getProfiles(req, res) {
    try {
        const userRepository = AppDataSource.getRepository(UserEntity);
        const { role } = req.user;

        let whereCondition = {};
        if (role === "admin") {
            whereCondition = [
                { role: "guardia" },
                { role: "user" }
            ];
        } else if (role === "guardia") {
            whereCondition = { role: "user" };
        } else {
            return handleErrorClient(res, 403, "No tienes permiso para acceder a esta información");
        }
        const profiles = await userRepository.find({
            where: whereCondition,
        });
        return handleSuccess(res, 200, "Perfiles obtenidos exitosamente", profiles);
    } catch (error) {
        console.error(error);
        return handleErrorServer(res, 500, "Error al obtener perfiles", error);
    }
}
export async function updatePrivateProfile(req, res) {
    try {
        const userRepository = AppDataSource.getRepository(UserEntity);
        const userId = req.user.sub;

        const { contact, password } = req.body;

        const user = await userRepository.findOne({
        where: { id: userId } });

        if (!user) return handleErrorClient(res, 404, "Usuario no encontrado");

        if (contact) user.contact = contact;
        if (password) {
        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        }

        await userRepository.save(user);

        handleSuccess(res, 200, "Perfil actualizado exitosamente", {
        id: user.id,
        email: user.email,
        contact: user.contact,
        });
    } catch (error) {
        handleErrorServer(res, 500, "Error al actualizar perfil", error);
    }
}