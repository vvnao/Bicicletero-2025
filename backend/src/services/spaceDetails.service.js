import { AppDataSource } from '../config/configDb.js';
import { formatSpaceData } from '../helpers/spaceDetails.helper.js';

const spaceRepository = AppDataSource.getRepository('Space');

export async function getSpaceDetailsService(spaceId) {
  try {
    const space = await spaceRepository.findOne({
      where: { id: spaceId },
      relations: [
        'bikerack',
        'currentLog',
        'currentLog.user',
        'currentLog.bicycle',
        'reservations',
        'reservations.user',
        'reservations.bicycle',
      ],
    });

    if (!space) {
      throw new Error('Espacio no encontrado');
    }

    const spaceData = formatSpaceData(space);

    return spaceData;
  } catch (error) {
    throw new Error(`Error obteniendo detalles del espacio: ${error.message}`);
  }
}
