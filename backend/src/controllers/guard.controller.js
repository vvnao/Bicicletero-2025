// controllers/guard.controller.js - VERSIÓN CORREGIDA
'use strict';

import { GuardService } from "../services/guard.service.js";
import HistoryService from "../services/history.service.js";
import { validateCreateGuard } from "../validations/guard.validation.js";

export class GuardController {
    constructor() {
        this.guardService = new GuardService();
        this.historyService = HistoryService;
        
        // 🔗 Bindeo de métodos para mantener el contexto
        this.createGuard = this.createGuard.bind(this);
        this.getAllGuards = this.getAllGuards.bind(this);
        this.getGuardById = this.getGuardById.bind(this);
        this.updateGuard = this.updateGuard.bind(this);
        this.toggleAvailability = this.toggleAvailability.bind(this);
        this.deactivateGuard = this.deactivateGuard.bind(this);
        this.activateGuard = this.activateGuard.bind(this);
        this.getGuardStats = this.getGuardStats.bind(this);
        this.findAvailableGuards = this.findAvailableGuards.bind(this);
    }

  /**
 * Crear un nuevo guardia - SOLO ADMIN
 */
async createGuard(req, res) {
    try {
        // 1. Verificar rol
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Solo los administradores pueden crear guardias"
            });
        }

        // 2. Validar datos con Joi
        const { error, value } = validateCreateGuard(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: error.details.map(err => err.message)
            });
        }

        // 3. Definir la variable (AQUÍ ESTABA EL ERROR)
        const guardDataWithRequest = {
            ...value,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        };

        // 4. Llamar al servicio
        const result = await this.guardService.createGuard(
            guardDataWithRequest, 
            req.user.id
        );
        
        // 5. Historial (Solo si el servicio tuvo éxito)
    if (result.success && result.data) {
    // Ya no pasas un objeto gigante, solo los datos
    await HistoryService.logGuardCreation(req.user.id, result.data.guard, req);
}

        return res.status(201).json(result);

    } catch (error) {
        console.error("Error en createGuard Controller:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error interno al crear el guardia"
        });
    }
}
w
    /**
     * Obtener todos los guardias - ADMIN Y GUARDIA
     */
    async getAllGuards(req, res) {
        try {
            const filters = {
                isAvailable: req.query.available,
                search: req.query.search
            };
            
            const guards = await this.guardService.getAllGuards(filters);
            
            res.status(200).json({
                success: true,
                count: guards.length,
                data: guards
            });
        } catch (error) {
            console.error("Error obteniendo guardias:", error);
            res.status(500).json({
                success: false,
                message: "Error al obtener los guardias"
            });
        }
    }

    /**
     * Obtener guardia por ID - ADMIN Y GUARDIA (solo su propio perfil o admin)
     */
    async getGuardById(req, res) {
        try {
            const guardId = parseInt(req.params.id);
            
            // Validar permisos: admin puede ver todos, guardia solo su propio perfil
            if (req.user.role !== 'admin' && req.user.id !== guardId) {
                return res.status(403).json({
                    success: false,
                    message: "Solo puedes ver tu propio perfil"
                });
            }

            const guard = await this.guardService.getGuardById(guardId);
            
            if (!guard) {
                return res.status(404).json({
                    success: false,
                    message: "Guardia no encontrado"
                });
            }
            
            res.status(200).json({
                success: true,
                data: guard
            });
        } catch (error) {
            console.error("Error obteniendo guardia:", error);
            res.status(500).json({
                success: false,
                message: "Error al obtener el guardia"
            });
        }
    }

    /**
     * Actualizar guardia - ADMIN (todo) o GUARDIA (solo campos permitidos)
     */
    async updateGuard(req, res) {
        try {
            const guardId = parseInt(req.params.id);
            
            // TODO: Importar validateUpdateGuard si existe
            // const { error, value } = validateUpdateGuard(req.body);
            // if (error) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Error de validación",
            //         errors: error.details.map(err => err.message)
            //     });
            // }

            const updatedGuard = await this.guardService.updateGuard(
                guardId, 
                req.body, 
                req.user.id, 
                req.user.role
            );
            
            res.status(200).json({
                success: true,
                message: "Guardia actualizado exitosamente",
                data: updatedGuard
            });
        } catch (error) {
            console.error("Error actualizando guardia:", error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            if (error.message.includes('No tienes permisos') || 
                error.message.includes('Solo puedes editar')) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: error.message || "Error al actualizar el guardia"
            });
        }
    }

    /**
     * Cambiar disponibilidad - ADMIN y el propio guardia
     */
    async toggleAvailability(req, res) {
        try {
            const guardId = parseInt(req.params.id);
            const { isAvailable } = req.body;

            // Validar permisos
            if (req.user.role !== 'admin' && req.user.id !== guardId) {
                return res.status(403).json({
                    success: false,
                    message: "Solo puedes cambiar tu propia disponibilidad"
                });
            }

            if (typeof isAvailable !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: "El campo isAvailable debe ser booleano"
                });
            }

            const guard = await this.guardService.toggleAvailability(guardId, isAvailable);
            
            await this.logHistory(
                isAvailable ? 'guard_activated' : 'guard_deactivated', 
                {
                    guardId: guard.id,
                    isAvailable: guard.isAvailable,
                    changedBy: req.user.id,
                    userAgent: req.headers['user-agent']
                },
                req.user.id
            );

            res.status(200).json({
                success: true,
                message: `Disponibilidad ${isAvailable ? 'activada' : 'desactivada'} exitosamente`,
                data: guard
            });
        } catch (error) {
            console.error("Error cambiando disponibilidad:", error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: "Error al cambiar disponibilidad"
            });
        }
    }

    /**
     * Desactivar guardia - SOLO ADMIN
     */
    async deactivateGuard(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden desactivar guardias"
                });
            }

            const guardId = parseInt(req.params.id);
            
            const result = await this.guardService.deactivateGuard(guardId);
            
             await this.logHistory('guard_deactivated', {
                guardId: guardId,
                deactivatedBy: req.user.id,
                reason: 'Desactivación manual'
            }, req.user.id);
            
            res.status(200).json({
                success: true,
                message: result.message || "Guardia desactivado exitosamente",
                data: result
            });
        } catch (error) {
            console.error("Error desactivando guardia:", error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: "Error al desactivar el guardia"
            });
        }
    }

    /**
     * Activar guardia - SOLO ADMIN
     */
    async activateGuard(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden activar guardias"
                });
            }

            const guardId = parseInt(req.params.id);
            
            const guard = await this.guardService.activateGuard(guardId);
            
            // 🟢 REGISTRAR EN HISTORIAL
             await this.logHistory('guard_activated', {
                guardId: guardId,
                activatedBy: req.user.id
            }, req.user.id);
            
            res.status(200).json({
                success: true,
                message: "Guardia activado exitosamente",
                data: guard
            });
        } catch (error) {
            console.error("Error activando guardia:", error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: "Error al activar el guardia"
            });
        }
    }

    /**
     * Obtener estadísticas del guardia - ADMIN Y GUARDIA (solo su propio perfil)
     */
    async getGuardStats(req, res) {
        try {
            const guardId = parseInt(req.params.id);
            
            // Validar permisos
            if (req.user.role !== 'admin' && req.user.id !== guardId) {
                return res.status(403).json({
                    success: false,
                    message: "Solo puedes ver tus propias estadísticas"
                });
            }

            const stats = await this.guardService.getGuardStats(guardId);
            
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error("Error obteniendo estadísticas:", error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: "Error al obtener estadísticas"
            });
        }
    }

    /**
     * Buscar guardias disponibles - ADMIN Y GUARDIA
     */
    async findAvailableGuards(req, res) {
        try {
            const { date, startTime, endTime } = req.query;
            
            if (!date || !startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    message: "Se requieren fecha, hora de inicio y hora de fin"
                });
            }

            const availableGuards = await this.guardService.findAvailableGuards(
                new Date(date),
                startTime,
                endTime
            );
            
            res.status(200).json({
                success: true,
                count: availableGuards.length,
                data: availableGuards
            });
        } catch (error) {
            console.error("Error buscando guardias disponibles:", error);
            res.status(500).json({
                success: false,
                message: "Error al buscar guardias disponibles"
            });
        }
    }
}

// Exportar instancia única
export default new GuardController();