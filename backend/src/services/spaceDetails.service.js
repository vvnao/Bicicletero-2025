import { AppDataSource } from '../config/configDb.js';
import { formatSpaceData } from '../helpers/spaceDetails.helper.js';
import { SpaceEntity } from '../entities/SpaceEntity.js';

const spaceRepository = AppDataSource.getRepository(SpaceEntity);

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
      console.log(`Espacio ${spaceId} no encontrado`);
      throw new Error('Espacio no encontrado');
    }

    return formatSpaceData(space);
  } catch (error) {
    console.error(
      `Error en getSpaceDetailsService para espacio ${spaceId}:`,
      error.message
    );
    throw error;
  }
}
