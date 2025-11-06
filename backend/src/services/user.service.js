import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/UserEntity.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(UserEntity);

export async function createUser(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = userRepository.create({
    email: data.email,
    password: hashedPassword,
});

    return await userRepository.save(newUser);
}

export async function findUserByEmail(email) {
    return await userRepository.findOneBy({ email });
}
