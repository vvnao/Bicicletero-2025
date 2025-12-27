// auth.service.js - VERSIÓN CORREGIDA
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "./user.service.js";
import guardServiceInstance from "./guard.service.js";

// CARGAR DOTENV - Esto es crítico
import dotenv from 'dotenv';
dotenv.config(); // ← AÑADE ESTA LÍNEA

console.log(' [AUTH] JWT_SECRET:', process.env.JWT_SECRET ? 'PRESENTE' : 'AUSENTE');

export async function loginUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Credenciales incorrectas");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  if (user.role === "user" && user.requestStatus !== "aprobado") {
    throw new Error("Tu registro aún no ha sido aprobado por un guardia.");
  }

  let guardId = null;
  let guardInfo = null;
  
  if (user.role === "guardia") {
    try {
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

  if (user.bicycles) {
    user.bicycles = user.bicycles.map((bike) => {
      const { user, ...bikeData } = bike;
      return bikeData;
    });
  }

  // DEBUG: Verificar que JWT_SECRET esté disponible
  if (!process.env.JWT_SECRET) {
    console.error(' [AUTH] JWT_SECRET NO DEFINIDO');
    throw new Error('Error de configuración del servidor');
  }

  // Crear payload del token
  const payload = { 
    id: user.id, 
    email: user.email, 
    role: user.role,
    guardId: guardId
  };

  console.log(' [AUTH] Generando token con payload:', payload);
  console.log(' [AUTH] JWT_SECRET longitud:', process.env.JWT_SECRET.length);

  // Generar token JWT
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5d" });

  console.log(' [AUTH] Token generado (primeros 50 chars):', token.substring(0, 50) + '...');

  delete user.password;

  const userResponse = {
    ...user,
    ...(guardId && { guardId: guardId }),
    ...(guardInfo && { guardInfo: guardInfo })
  };

  return { user: userResponse, token };
}