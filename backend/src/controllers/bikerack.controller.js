import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import { storeBicycle, removeBicycle, assignGuard, getBikeracks } from "../services/bikerack.service.js";

export async function listBikeracks(req, res) {
    try {
        const racks = await getBikeracks();
        return handleSuccess(res, 200, "Bicicleteros obtenidos", racks);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
    }

    export async function assignGuardController(req, res) {
    try {
        const { bikerackId, guardId } = req.params;
        const result = await assignGuard(parseInt(bikerackId), parseInt(guardId));
        return handleSuccess(res, 200, "Guardia asignado correctamente", result);
    } catch (error) {
        return handleErrorClient(res, 400, error.message);
    }
    }

    export async function storeBicycleController(req, res) {
    try {
        const { bikerackId, bicycleId } = req.params;
        const result = await storeBicycle(parseInt(bikerackId), parseInt(bicycleId));
        return handleSuccess(res, 200, "Bicicleta almacenada en el bicicletero", result);
    } catch (error) {
        return handleErrorClient(res, 400, error.message);
    }
    }

    export async function removeBicycleController(req, res) {
    try {
        const { bicycleId } = req.params;
        const result = await removeBicycle(parseInt(bicycleId));
        return handleSuccess(res, 200, "Bicicleta retirada del bicicletero", result);
    } catch (error) {
        return handleErrorClient(res, 400, error.message);
    }
}
