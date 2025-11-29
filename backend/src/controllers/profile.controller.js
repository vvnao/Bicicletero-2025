import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { getPrivateProfileService, getProfilesService, updatePrivateProfileService} from "../services/profile.service.js";

export async function getPrivateProfile(req, res) {
    try {
        const userId = req.user.sub;

        const data = await getPrivateProfileService(userId);

        if (!data) return handleErrorClient(res, 404, "Usuario no encontrado");

        delete data.password;

        handleSuccess(res, 200, "Perfil privado obtenido exitosamente", {
            userData: data,
        });
    } catch (error) {
        handleErrorServer(res, 500, "Error del servidor", error);
    }
}

export async function getProfiles(req, res) {
    try {
        const { role } = req.user;
        const data= await getProfilesService(role);

        if (!data) return handleErrorClient(res, 403, "No tienes permiso para acceder a esta información");
        
        data.forEach(user => {
            delete user.password;
        });

        return handleSuccess(res, 200, "Perfiles obtenidos exitosamente", data);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener perfiles", error);
    }
}

export async function updatePrivateProfile(req, res) {
    try {
        const userId = req.user.sub;
        const data = req.body;

        const updatedUser = await updatePrivateProfileService(userId, data);

        if (!updatedUser)
            return handleErrorClient(res, 404, "Usuario no encontrado");

        return handleSuccess(res, 200, "Perfil actualizado exitosamente", {
            id: updatedUser.id,
            email: updatedUser.email,
            contact: updatedUser.contact,
        });
    } catch (error) {
        handleErrorServer(res, 500, "Error al actualizar perfil", error);
    }
}
