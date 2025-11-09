import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "./user.service.js";

export async function loginUser(email, password) {
  // Buscar usuario por email
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Credenciales incorrectas");
  }

  // Comparar contraseña
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  // Bloquear acceso si el usuario no está aprobado
  if (user.role === "user" && user.requestStatus !== "aprobado") {
    throw new Error("Tu registro aún no ha sido aprobado por un guardia.");
  }

  // Crear payload del token
  const payload = { sub: user.id, email: user.email, role: user.role };

  // Generar token JWT
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Eliminar contraseña antes de devolver
  delete user.password;

  return { user, token };
}
