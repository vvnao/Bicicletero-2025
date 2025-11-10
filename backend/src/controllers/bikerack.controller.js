import {
  getBikeracksSummary,
  getBikerackDetail,
} from '../services/bikerackDashboard.service.js';
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from '../Handlers/responseHandlers.js';

//////////////////////////////////////////////////////////////////////////////////////////////////
//! PARA EL PANEL DE MONITOREO
export async function getDashboard(req, res) {
  try {
    console.log('Obteniendo dashboard...');

    const bikeracksSummary = await getBikeracksSummary();

    handleSuccess(
      res,
      200,
      'Dashboard obtenido exitosamente!',
      bikeracksSummary
    );
  } catch (error) {
    console.error('Error en getDashboard:', error);
    handleErrorServer(res, 500, 'Error al obtener el dashboard', error.message);
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//! PARA LA VISTA DETALLADA DE CADA BICICLETERO
export async function getBikerackSpaces(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, 'ID de bicicletero inválido');
    }

    console.log(`Obteniendo espacios del bicicletero ID: ${id}...`);

    const bikerackDetail = await getBikerackDetail(parseInt(id));

    handleSuccess(
      res,
      200,
      'Espacios del bicicletero obtenidos exitosamente!',
      bikerackDetail
    );
  } catch (error) {
    console.error('Error en getBikerackSpaces:', error);

    if (error.message.includes('no encontrado')) {
      return handleErrorClient(
        res,
        404,
        'Bicicletero no encontrado',
        error.message
      );
    }

    handleErrorServer(
      res,
      500,
      'Error al obtener los espacios del bicicletero',
      error.message
    );
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////
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