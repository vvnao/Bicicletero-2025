//! PARA INICIALIZAR LOS BICICLETEROS EN LA BASE DE DATOS
'use strict';
import { AppDataSource } from './configDb.js';
import { BikerackEntity } from '../entities/BikeRackEntity.js';

export async function createBikeracks() {
  try {
    const bikerackRepository = AppDataSource.getRepository(BikerackEntity);

    const count = await bikerackRepository.count();
    if (count > 0) return;

    const bikeracks = [
      {
        name: 'Bicicletero Central',
        capacity: 40,
      },
      {
        name: 'Bicicletero Norte',
        capacity: 40,
      },
      {
        name: 'Bicicletero Sur',
        capacity: 40,
      },
      {
        name: 'Bicicletero Este',
        capacity: 40,
      },
    ];

    console.log('Creando bicicleteros...');

    for (const bikerack of bikeracks) {
      await bikerackRepository.save(bikerackRepository.create(bikerack));
      console.log(`Bicicletero ${bikerack.name} creado exitosamente!`);
    }

    console.log('Todos los bicicleteros creados exitosamente!');

  } catch (error) {
    console.error('Error al crear bicicleteros:', error);
    process.exit(1);
  }
}