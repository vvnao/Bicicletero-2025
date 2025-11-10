//! PARA INICIALIZAR LOS BICICLETEROS EN LA BASE DE DATOS
'use strict';
import { AppDataSource } from './configDb.js';
import { Bikerack } from '../entities/BikerackEntity.js';

export async function createBikeracks() {
  try {
    const bikerackRepository = AppDataSource.getRepository(Bikerack);

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
      console.log(`Bicicletero ${bikerack.name} creado exitodamente!`);
    }
  } catch (error) {
    console.error('Error al crear bicicleteros:', error);
    process.exit(1);
  }
}
