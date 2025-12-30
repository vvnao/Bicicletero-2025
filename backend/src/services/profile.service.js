import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import { ensureAbsoluteUrl } from "../helpers/url.helper.js";
import bcrypt from "bcrypt";

export async function getPrivateProfileService(userId) {
    const userRepository = AppDataSource.getRepository(UserEntity);

    const user = await userRepository.findOne({
        where: { id: userId },
    });

    if (user) {
        user.tnePhoto = ensureAbsoluteUrl(user.tnePhoto);
        user.personalPhoto = ensureAbsoluteUrl(user.personalPhoto);
        
        if (user.bicycles && Array.isArray(user.bicycles)) {
            user.bicycles = user.bicycles.map(bicycle => ({
                ...bicycle,
                photo: ensureAbsoluteUrl(bicycle.photo)
            }));
        }
    }

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

    const { contact, email, tnePhoto, personalPhoto } = data;

    if (contact) user.contact = contact;
    if (email) user.email = email;

    if (tnePhoto) {
        user.tnePhoto = ensureAbsoluteUrl(tnePhoto);
    }
    if (personalPhoto) {
        user.personalPhoto = ensureAbsoluteUrl(personalPhoto);
    }

    await userRepository.save(user);
    return user;
}
export async function softDeleteProfileService(rut) {
    const userRepository = AppDataSource.getRepository(UserEntity);

    const user = await userRepository.findOne({ where: { rut } });
    if (!user) {
        return null;
    }
    if (!user.isActive) {
        return "false";
    }
    user.isActive = false;
    await userRepository.save(user);

    return user;
}
export async function softActiveProfileService(rut) {
    const userRepository = AppDataSource.getRepository(UserEntity);

    const user = await userRepository.findOne({ where: { rut } });
    if (!user) {
        return null;
    }
    if (user.isActive) {
        return "true";
    }
    user.isActive = true;
    await userRepository.save(user);

    return (user);
}