// auth.service.js - VERSIÓN CORREGIDA
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "./user.service.js";
import guardServiceInstance from "./guard.service.js"; // ← Importar la instancia directamente


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

  // Obtener guardId si el usuario es guardia
  let guardId = null;
  let guardInfo = null;
  
  if (user.role === "guardia") {
    try {
      // Usar la instancia importada directamente
      const guard = await guardServiceInstance.getGuardByUserId(user.id);
      if (guard) {
        guardId = guard.id;
        guardInfo = {
          phone: guard.phone,
          isAvailable: guard.isAvailable,
          rating: guard.rating || 0
        };
      }
    } catch (error) {
      console.warn(' No se pudo obtener información del guardia:', error.message);
    }
  }

  // Para que no se repita el user al hacer login
  if (user.bicycles) {
    user.bicycles = user.bicycles.map((bike) => {
      const { user, ...bikeData } = bike;
      return bikeData;
    });
  }

  // Crear payload del token (INCLUYENDO guardId)
  const payload = { 
    sub: user.id, 
    email: user.email, 
    role: user.role,
    guardId: guardId
  };

  // Generar token JWT
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5d" });

  // Eliminar contraseña antes de devolver
  delete user.password;

  // Agregar guardId a la respuesta del usuario
  const userResponse = {
    ...user,
    ...(guardId && { guardId: guardId }),
    ...(guardInfo && { guardInfo: guardInfo })
  };

  return { user: userResponse, token };
}