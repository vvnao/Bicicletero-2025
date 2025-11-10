import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";
import Bikerack from "../entities/BikeRackEntity.js";




    const bikerackRepository = AppDataSource.getRepository(Bikerack);
    const userRepository = AppDataSource.getRepository(UserEntity);
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

    // LISTAR TODOS LOS BICICLETEROS CON OCUPACIÓN
    export async function getBikeracks() {
        const racks = await bikerackRepository.find({ relations: ["guard"] });

        for (const rack of racks) {
        const used = await bicycleRepository.count({ where: { bikerack: rack.id } });
        rack.usedCapacity = used;
        }

        return racks;
    }

    // ASIGNAR GUARDIA A UN BICICLETERO
    export async function assignGuard(bikerackId, guardId) {
        const rack = await bikerackRepository.findOneBy({ id: bikerackId });
        if (!rack) throw new Error("El bicicletero no existe");

        const guard = await userRepository.findOneBy({ id: guardId });
        if (!guard || guard.role !== "guardia") {
        throw new Error("El usuario seleccionado no es guardia");
        }

        rack.guard = guard;
        return await bikerackRepository.save(rack);
    }

    // GUARDAR UNA BICICLETA EN UN BICICLETERO
    export async function storeBicycle(bikerackId, bicycleId) {
        const rack = await bikerackRepository.findOneBy({ id: bikerackId });
        if (!rack) throw new Error("El bicicletero no existe");

        // Verificar capacidad
        const used = await bicycleRepository.count({ where: { bikerack: bikerackId } });
        if (used >= rack.capacity) throw new Error("El bicicletero está lleno");

        const bicycle = await bicycleRepository.findOneBy({ id: bicycleId });
        if (!bicycle) throw new Error("La bicicleta no existe");

        bicycle.bikerack = rack;
        return await bicycleRepository.save(bicycle);
    }

     // REMOVER UNA BICICLETA DEL BICICLETERO
    export async function removeBicycle(bicycleId) {
        const bicycle = await bicycleRepository.findOne({
            where: { id: bicycleId },
            relations: ["bikerack"]
        });

        if (!bicycle) throw new Error("La bicicleta no existe en ningún bicicletero");

        bicycle.bikerack = null;
        return await bicycleRepository.save(bicycle);
    }

    // GENERAR REPORTES SEMANALES
    export async function generateWeeklyReport() {
        const bikerackRepo = AppDataSource.getRepository(Bikerack);
        const bicycleRepo = AppDataSource.getRepository(BicycleEntity);

        const racks = await bikerackRepo.find({ relations: ["guard", "bicycles", "incidences"] });

        const report = racks.map(rack => {
            const used = rack.bicycles.length; // o contar con bicycleRepo.count({ where: { bikerack: rack.id } })
            return {
            id: rack.id,
            name: rack.name,
            location: rack.location,
            capacity: rack.capacity,
            usedCapacity: used,
            guard: rack.guard ? rack.guard.names + " " + rack.guard.lastName : "Sin asignar",
            incidences: rack.incidences.length,
            };
        });

        return report;
    }

