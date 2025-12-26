// src/constants/roles.constants.js
export const ROLES = {
  ADMIN: 'admin',
  GUARD: 'guardia',
  USER: 'user' // Nota: en tu UserEntity dice 'user' no 'usuario'
};

export const ALL_ROLES = Object.values(ROLES);

// Uso:
import { ROLES } from '../constants/roles.constants.js';
router.get('/', checkRole([ROLES.ADMIN, ROLES.GUARD]), getHistoryController);