import { AppDataSource } from '../config/configDb.js';
import { formatSpaceData } from '../helpers/spaceDetails.helper.js';

const spaceRepository = AppDataSource.getRepository('Space');

export async function getSpaceDetailsService(spaceId) {
  try {
    const space = await spaceRepository.findOne({
      where: { id: spaceId },
      relations: [
        'bikerack',
        'spaceLogs',
        'spaceLogs.user',
        'spaceLogs.bicycle',
        'reservations',
        'reservations.user',
        'reservations.bicycle',
      ],
    });

    if (!space) {
      throw new Error('Espacio no encontrado');
    }

    return formatSpaceData(space);
  } catch (error) {
    if (error.message === 'Espacio no encontrado') {
      throw error;
    }
    throw new Error(`Error obteniendo detalles del espacio: ${error.message}`);
  }
}
