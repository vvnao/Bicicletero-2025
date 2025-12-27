import { getSpaceDetailsService } from '../services/spaceDetails.service.js';
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from '../Handlers/responseHandlers.js';

export async function getSpaceDetails(req, res) {
  try {
    const { spaceId } = req.params;

    if (!spaceId || isNaN(parseInt(spaceId))) {
      return handleErrorClient(res, 400, 'ID de espacio inválido');
    }

    console.log(`Obteniendo detalles del espacio ID: ${spaceId}`);

    const spaceData = await getSpaceDetailsService(parseInt(spaceId));

    handleSuccess(
      res,
      200,
      'Datos del espacio obtenidos exitosamente',
      spaceData
    );
  } catch (error) {
    console.error('Error en getSpaceDetails:', error.message);

    if (error.message === 'Espacio no encontrado') {
      return handleErrorClient(res, 404, 'El espacio solicitado no existe');
    }

    handleErrorServer(
      res,
      500,
      'Error interno al procesar los detalles del espacio'
    );
  }
}
