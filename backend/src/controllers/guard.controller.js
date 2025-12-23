// src/controllers/guard.controller.js
import { GuardService } from "../services/guard.service.js";
import { validateCreateGuard, validateUpdateGuard } from "../validations/guard.validation.js";

export class GuardController {
    constructor() {
        this.guardService = new GuardService();
    }

    /**
     * Crear un nuevo perfil de guardia
     */
    createGuard = async (req, res) => {
        try {
            // Validar datos de entrada
            const { error, value } = validateCreateGuard(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Datos inválidos",
                    errors: error.details.map(err => err.message)
                });
            }

            const { userId, ...guardData } = value;
            
            // Verificar permisos (solo admin puede crear guardias)
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permisos para realizar esta acción"
                });
            }

            const guard = await this.guardService.createGuard(userId, guardData);
            
            res.status(201).json({
                success: true,
                message: "Perfil de guardia creado exitosamente",
                data: guard
            });

        } catch (error) {
            console.error("Error creando guardia:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Error al crear el perfil de guardia"
            });
        }
    };

    /**
     * Obtener todos los guardias
     */
    getAllGuards = async (req, res) => {
        try {
            const filters = {
                isAvailable: req.query.available ? req.query.available === 'true' : undefined,
                search: req.query.search || undefined
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
    };

    /**
     * Obtener guardia por ID
     */
    getGuardById = async (req, res) => {
        try {
            const { id } = req.params;
            const guard = await this.guardService.getGuardById(parseInt(id));

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
    };

    /**
     * Actualizar guardia
     */
    updateGuard = async (req, res) => {
        try {
            const { id } = req.params;
            
            // Validar datos de entrada
            const { error, value } = validateUpdateGuard(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Datos inválidos",
                    errors: error.details.map(err => err.message)
                });
            }

            // Verificar permisos (admin o el mismo guardia)
            if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permisos para actualizar este perfil"
                });
            }

            const updatedGuard = await this.guardService.updateGuard(parseInt(id), value);
            
            res.status(200).json({
                success: true,
                message: "Guardia actualizado exitosamente",
                data: updatedGuard
            });

        } catch (error) {
            console.error("Error actualizando guardia:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Error al actualizar el guardia"
            });
        }
    };

    /**
     * Cambiar disponibilidad del guardia
     */
    toggleAvailability = async (req, res) => {
        try {
            const { id } = req.params;
            const { isAvailable } = req.body;

            if (typeof isAvailable !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: "El campo isAvailable debe ser un booleano"
                });
            }

            // Solo admin o el mismo guardia puede cambiar disponibilidad
            if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permisos para cambiar la disponibilidad"
                });
            }

            const guard = await this.guardService.toggleAvailability(parseInt(id), isAvailable);
            
            res.status(200).json({
                success: true,
                message: `Guardia marcado como ${isAvailable ? 'disponible' : 'no disponible'}`,
                data: guard
            });

        } catch (error) {
            console.error("Error cambiando disponibilidad:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Error al cambiar la disponibilidad"
            });
        }
    };

    /**
     * Desactivar guardia (soft delete)
     */
    deactivateGuard = async (req, res) => {
        try {
            const { id } = req.params;

            // Solo admin puede desactivar guardias
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden desactivar guardias"
                });
            }

            const result = await this.guardService.deactivateGuard(parseInt(id));
            
            res.status(200).json({
                success: true,
                message: result.message
            });

        } catch (error) {
            console.error("Error desactivando guardia:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Error al desactivar el guardia"
            });
        }
    };

    /**
     * Activar guardia
     */
    activateGuard = async (req, res) => {
        try {
            const { id } = req.params;

            // Solo admin puede activar guardias
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden activar guardias"
                });
            }

            const guard = await this.guardService.activateGuard(parseInt(id));
            
            res.status(200).json({
                success: true,
                message: "Guardia activado exitosamente",
                data: guard
            });

        } catch (error) {
            console.error("Error activando guardia:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Error al activar el guardia"
            });
        }
    };

    /**
     * Obtener estadísticas del guardia
     */
    getGuardStats = async (req, res) => {
        try {
            const { id } = req.params;
            const stats = await this.guardService.getGuardStats(parseInt(id));
            
            res.status(200).json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error("Error obteniendo estadísticas:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Error al obtener estadísticas"
            });
        }
    };

    /**
     * Buscar guardias disponibles
     */
    findAvailableGuards = async (req, res) => {
        try {
            const { date, startTime, endTime } = req.query;

            if (!date || !startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    message: "Se requieren los parámetros: date, startTime, endTime"
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
                message: error.message || "Error al buscar guardias disponibles"
            });
        }
    };
}


export default new GuardController();