import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";
import Bikerack from "../entities/BikeRackEntity.js";
import { GuardAssignmentEntity } from "../entities/GuardAssignmentEntity.js";
import { createHistory } from "../services/history.service.js";


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

    //* ASIGNAR GUARDIA A UN BICICLETERO
    export async function assignGuard(bikerackId, guardId) {
        const rack = await bikerackRepository.findOneBy({ id: bikerackId });
        if (!rack) throw new Error("El bicicletero no existe");

        const guard = await userRepository.findOneBy({ id: guardId });
        if (!guard || guard.role !== "guardia") {
            throw new Error("El usuario seleccionado no es guardia");
        }

        // Asignar guardia actual al bicicletero
        rack.guard = guard;
        await bikerackRepository.save(rack);

        // Registrar la asignación en la tabla guard_assignment
        const assignmentRepo = AppDataSource.getRepository(GuardAssignmentEntity);
        const newAssignment = assignmentRepo.create({
            guard,
            bikerack: rack,
            assignedAt: new Date(),
        });
        await assignmentRepo.save(newAssignment);

        return { message: "Guardia asignado correctamente", rack };
    }

    //* GUARDAR UNA BICICLETA EN UN BICICLETERO

        export async function storeBicycle(bikerackId, bicycleId, userId) {
        const rack = await bikerackRepository.findOneBy({ id: bikerackId });
        if (!rack) throw new Error("El bicicletero no existe");

        // Verificar capacidad
        const used = await bicycleRepository.count({ where: { bikerack: bikerackId } });
        if (used >= rack.capacity) throw new Error("El bicicletero está lleno");

        const bicycle = await bicycleRepository.findOneBy({ id: bicycleId });
        if (!bicycle) throw new Error("La bicicleta no existe");

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("El usuario no existe");

        // Guardar la bicicleta en el bicicletero
        bicycle.bikerack = rack;
        await bicycleRepository.save(bicycle);

        // ✅ Registrar la ENTRADA en el historial
        await createHistory(user, bicycle, rack, "Entrada");

        return { message: "Bicicleta almacenada correctamente", bicycle };
        }


     // REMOVER UNA BICICLETA DEL BICICLETERO
    export async function removeBicycle(bicycleId, userId) {
        const bicycle = await bicycleRepository.findOne({
            where: { id: bicycleId },
            relations: ["bikerack"],
        });

        if (!bicycle) throw new Error("La bicicleta no existe en ningún bicicletero");

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("El usuario no existe");

        const rack = bicycle.bikerack;

        // Eliminar relación
        bicycle.bikerack = null;
        await bicycleRepository.save(bicycle);

        //  Registrar la SALIDA en el historial
        await createHistory(user, bicycle, rack, "Salida");

        return { message: "Bicicleta retirada correctamente", bicycle };
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

