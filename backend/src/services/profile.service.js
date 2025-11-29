import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import bcrypt from "bcrypt";

export async function getPrivateProfileService(userId) {
    const userRepository = AppDataSource.getRepository(UserEntity);

    const user = await userRepository.findOne({
        where: { id: userId },
    });

    return user; 
}

export async function getProfilesService(role) {
    const userRepository = AppDataSource.getRepository(UserEntity);

    let whereCondition = null;

    if (role === "admin") {
        whereCondition = [
            { role: "guardia" },
            { role: "user" }
        ];
    } else if (role === "guardia") {
        whereCondition = { role: "user" };
    } else {
        return null; 
    }

    const profiles = await userRepository.find({
        where: whereCondition,
    });

    return profiles;
}
export async function updatePrivateProfileService(userId, data) {
    const userRepository = AppDataSource.getRepository(UserEntity);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    const { contact, password } = data;

    if (contact) user.contact = contact;

    if (password) {
        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
    }

    await userRepository.save(user);
    return user;
}
