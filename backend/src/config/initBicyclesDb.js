//! ARCHIVO TEMPORAL POR QUE AÚN NO SE IMPLEMENTA EL SISTEMA PARA CREAR BICICLETAS 
'use strict';
import { AppDataSource } from './configDb.js';
import { BicycleEntity } from '../entities/BicycleEntity.js';
import { UserEntity } from '../entities/UserEntity.js';
import { createHistoryEvent } from '../helpers/historyHelper.js';

export async function createBicycles() {
  try {
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);
    const userRepository = AppDataSource.getRepository(UserEntity);

    const count = await bicycleRepository.count();
    if (count > 0) return;

    const users = await userRepository.find();
    if (users.length === 0) {
      console.log('No hay usuarios para asociar bicicletas');
      return;
    }

    const Bicycles = [
      {
        brand: 'Oxford',
        model: 'ARO 29',
        color: 'Azul',
        user: users[0], 
      },
      {
        brand: 'Trek',
        model: 'Marlin 5',
        color: 'Rojo',
        user: users[1], 
      },
      {
        brand: 'Specialized',
        model: 'Rockhopper',
        color: 'Negro',
        user: users[1], 
      },
    ];

    for (const bicycle of Bicycles) {
      await bicycleRepository.save(bicycleRepository.create(bicycle));
      console.log(
        `Bicicleta ${bicycle.brand} ${bicycle.model} creada`
      );
    }

    console.log('Todas las bicicletas creadas exitosamente!');
    
  } catch (error) {
    console.error('Error creando bicicletas:', error);
  }
}

await createHistoryEvent({
  historyType: 'bicycle_registered', 
  description: `🚲 ${user.names} registró bicicleta ${bicycle.brand}`,
  details: { brand: bicycle.brand, serial: bicycle.serialNumber },
  userId: user.id,
  bicycleId: bicycle.id,
  timestamp: new Date()
});