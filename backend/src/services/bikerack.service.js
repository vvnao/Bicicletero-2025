import { AppDataSource } from "../config/configDb.js";
import { Bikerack } from "../entities/Bikerack.js";
import { UserEntity } from "../entities/UserEntity.js";
import { BicycleEntity } from "../entities/BicycleEntity.js";

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
