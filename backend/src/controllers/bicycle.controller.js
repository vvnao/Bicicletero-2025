"use strict";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { createBicycleService } from "../services/bicycle.service.js";
import { bicycleValidation } from "../validations/bicycle.validation.js";

export async function createBicycle(req,res){
    try{
        const{error} = bicycleValidation.validate(req.body);
        if(error){
            const mensaje = error.details[0].message;
            return handleErrorClient(res, 400, error.mensaje);
        }
        const userId = req.user.sub;
        if(!userId){
            return handleErrorClient(res, 401, "Usuario no autenticado");
        }
        const newBicycle = await createBicycleService(req.body, userId);
        handleSuccess(res, 201, "Bicicleta creada exitosamente",newBicycle);
    }catch(error){
        handleErrorServer(res,500, error.message);
    }
}