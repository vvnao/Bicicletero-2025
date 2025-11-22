//! PARA INICIALIZAR LOS ESPACIOS DE LOS BICICLETEROS EN LA BASE DE DATOS
'use strict';
import { AppDataSource } from './configDb.js';
import { SpaceEntity, SPACE_STATUS } from '../entities/SpaceEntity.js';
import { BikerackEntity } from '../entities/BikerackEntity.js';

export async function createSpaces() {
  try {
    const spaceRepository = AppDataSource.getRepository(SpaceEntity);
    const bikerackRepository = AppDataSource.getRepository(BikerackEntity);

    const count = await spaceRepository.count();
    if (count > 0) return;

    const bikeracks = await bikerackRepository.find();
    if (bikeracks.length === 0) {
      throw new Error('Primero inicializar bicicleteros');
    }

    //* Configuración para cada bicicletero (prefijos y cantidad de espacios)
    const bikerackConfig = {
      'Bicicletero Central': { prefix: 'C', count: 40 },
      'Bicicletero Norte': { prefix: 'N', count: 40 },
      'Bicicletero Sur': { prefix: 'S', count: 40 },
      'Bicicletero Este': { prefix: 'E', count: 40 },
    };

    console.log('Creando espacios...');

    for (const bikerack of bikeracks) {
      const config = bikerackConfig[bikerack.name];

      if (!config) {
        console.log(`No hay configuración para: ${bikerack.name}`);
        continue;
      }

      const spaces = [];

      for (let i = 1; i <= config.count; i++) {
        const space = spaceRepository.create({
          spaceCode: `${config.prefix}-${i}`,
          status: SPACE_STATUS.FREE,
          position: i,
          bikerack: bikerack,
        });

        spaces.push(space);
      }

      await spaceRepository.save(spaces);
      console.log(
        `${config.count} espacios creados para ${bikerack.name} (${config.prefix}-1 a ${config.prefix}-${config.count})`
      );
    }

    console.log('Todos los espacios creados exitosamente!');
  } catch (error) {
    console.error('Error al crear espacios:', error);
    process.exit(1);
  }
}
