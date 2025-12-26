import { AppDataSource } from "../config/configDb.js";
import UserEntity from "../entities/UserEntity.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { getPrivateProfileService, getProfilesService, softActiveProfileService, softDeleteProfileService, updatePrivateProfileService} from "../services/profile.service.js";

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
            email: updatedUser.email,
            contact: updatedUser.contact,
            photo: updatedUser.photo,
        });
    } catch (error) {
        handleErrorServer(res, 500, "Error al actualizar perfil", error);
    }
}
//Solo el administrador podrá desactivar perfiles
export async function softDeleteProfileUser(req, res){
    try{
        const role = req.user.role;
        const { rut } = req.body;

        if(role!=="admin"){
            return handleErrorClient(res, 403, "No posee los permisos para realizar esta acción");
        }

        const user = await softDeleteProfileService(rut);

        if(!user) {
            return handleErrorClient(res, 404, "Usuario no encontrado");
        }
        if (user==="false") {
            return handleErrorClient(res, 400, "El perfil ya está desactivado");
        }
        if (user.role === req.user.role) {
            return handleErrorClient(res, 400, "No puede desactivar su propio perfil");
        }

        return handleSuccess(res, 200, "Perfil desactivado exitosamente");
    }catch(error){
        return handleErrorServer(res, 500 , "Error del servidor");
    }
}
export async function softActivateProfile(req, res){
    try{
        const role = req.user.role;
        const { rut } = req.body;

        if(role!=="admin"){
            return handleErrorClient(res, 403, "No posee los permisos para realizar esta acción");
        }

        const user = await softActiveProfileService(rut);

        if(!user) {
            return handleErrorClient(res, 404, "Usuario no encontrado");
        }
        if (user==="true") {
            return handleErrorClient(res, 400, "El perfil ya está activado");
        }

        return handleSuccess(res, 200, "Perfil activado exitosamente");
    }catch (error){
        return handleErrorServer(res, 500, "Error del servidor");
    }
}