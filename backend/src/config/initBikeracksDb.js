'use strict';
import { AppDataSource } from './configDb.js';
import { Bikerack } from '../entities/BikeRackEntity.js';

    export async function createBikeracks() {
    try {
        const bikerackRepository = AppDataSource.getRepository(Bikerack);

        const count = await bikerackRepository.count();
        if (count > 0) return;

        const bikeracks = [
            {
                name: 'Bicicletero Central',
                location: 'Campus UBB sector central',
                capacity: 40,
                status: 'activo'
            },
            {
                name: 'Bicicletero Norte',
                location: 'Campus UBB sector norte',
                capacity: 40,
                status: 'activo'
            },
            {
                name: 'Bicicletero Sur',
                location: 'Campus UBB sector sur',
                capacity: 40,
                status: 'activo'
            },
            {
                name: 'Bicicletero Este',
                location: 'Campus UBB sector este',
                capacity: 40,
                status: 'activo'
            }
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