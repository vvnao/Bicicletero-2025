import { AppDataSource } from "../config/configDb.js";
import { GuardAssignmentEntity } from "../entities/GuardAssignmentEntity.js";
import { User } from "../entities/User.js";
import { Bikerack } from "../entities/Bikerack.js";

export async function assignGuard(guardId, bikerackId) {
    const guardRepo = AppDataSource.getRepository(User);
    const bikerackRepo = AppDataSource.getRepository(Bikerack);
    const assignmentRepo = AppDataSource.getRepository(GuardAssignmentEntity);

    //Verificar que el guardia existe
    const guard = await guardRepo.findOneBy({ id: guardId });
    if (!guard) throw new Error("El guardia no existe");

    //Verificar que el bicicletero existee
    const bikerack = await bikerackRepo.findOneBy({ id: bikerackId });
    if (!bikerack) throw new Error("El bicicletero no existe");

    // Verificar que no haya asignación activa para ese guardia en ese bicicletero
    const existing = await assignmentRepo.findOneBy({
        guard: { id: guardId },
        bikerack: { id: bikerackId },
        status: "activo"
    });
    if (existing) throw new Error("El guardia ya tiene asignación activa en este bicicletero");

    // Crear la asignación
    const newAssignment = assignmentRepo.create({
        guard,
        bikerack,
        status: "activo"
    });

    await assignmentRepo.save(newAssignment);
    return newAssignment;
}
