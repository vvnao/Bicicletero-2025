import { AppDataSource } from '../config/configDb.js';
import { SPACE_STATUS } from '../entities/SpaceEntity.js';

import {
  calculateLastUpdate,
  formatLastUpdate,
} from '../helpers/bikerack.helper.js';

const bikerackRepository = AppDataSource.getRepository('Bikerack');

//! DASHBOARD 4 BICICLETEROS
export async function getBikeracksSummary() {
  try {
    const bikeracks = await bikerackRepository.find({
      relations: ['spaces'],
    });

    const summary = await Promise.all(
      bikeracks.map(async (bikerack) => {
        const spaces = bikerack.spaces || [];

        //! para cada bicicletero, cuento los espacios por estado
        const availableSpaces = spaces.filter(
          (space) => space.status === SPACE_STATUS.FREE
        ).length;
        const occupiedSpaces = spaces.filter(
          (space) => space.status === SPACE_STATUS.OCCUPIED
        ).length;
        const reservedSpaces = spaces.filter(
          (space) => space.status === SPACE_STATUS.RESERVED
        ).length;
        const overdueSpaces = spaces.filter(
          (space) => space.status === SPACE_STATUS.TIME_EXCEEDED
        ).length;

        //! esto es para calcular el porcentaje de ocupación, lo usaré para el panel de monitoreo
        const totalInUse = occupiedSpaces + overdueSpaces;
        const occupancyPercentage =
          bikerack.capacity > 0
            ? Math.round((totalInUse / bikerack.capacity) * 100)
            : 0;

        //! para calcular la última actualización, tmb lo usaré en el panel de monitoreo
        const lastUpdate = calculateLastUpdate(spaces);

        return {
          id: bikerack.id,
          name: bikerack.name,
          capacity: bikerack.capacity,
          availableSpaces,
          occupiedSpaces,
          reservedSpaces,
          overdueSpaces,
          totalInUse,
          occupancyPercentage,
          lastUpdate: formatLastUpdate(lastUpdate),
        };
      })
    );

    return summary;
  } catch (error) {
    throw new Error(`Error al obtener resumen bicicleteros: ${error.message}`);
  }
}

//! Vista detallada de cada bicicletero (datos específicosde un solo bicicletero)
export async function getBikerackDetail(bikerackId) {
  try {
    const bikerack = await bikerackRepository.findOne({
      where: { id: bikerackId },
      relations: ['spaces'],
    });

    if (!bikerack) {
      throw new Error('Bicicletero no encontrado');
    }

    //! array de espacios ordenados por código
    const sortedSpaces = (bikerack.spaces || []).sort((a, b) => {
      return a.spaceCode.localeCompare(b.spaceCode, undefined, {
        numeric: true,
      });
    });

    //! objeto con conteo de espacios por estado
    const spaceCounts = {
      free: sortedSpaces.filter((space) => space.status === SPACE_STATUS.FREE)
        .length,
      reserved: sortedSpaces.filter(
        (space) => space.status === SPACE_STATUS.RESERVED
      ).length,
      occupied: sortedSpaces.filter(
        (space) => space.status === SPACE_STATUS.OCCUPIED
      ).length,
      overdue: sortedSpaces.filter(
        (space) => space.status === SPACE_STATUS.TIME_EXCEEDED
      ).length,
    };

    return {
      bikerack: {
        id: bikerack.id,
        name: bikerack.name,
        capacity: bikerack.capacity,
      },
      spaceCounts,
      spaces: sortedSpaces.map((space) => ({
        id: space.id,
        spaceCode: space.spaceCode,
      })),
    };
  } catch (error) {
    throw new Error(`Error al obtener detalles bicicletero: ${error.message}`);
  }
}
