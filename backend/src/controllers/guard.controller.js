// controllers/guard.controller.js - CORREGIDO
import { GuardService } from "../services/guard.service.js";
import { validateCreateGuard } from "../validations/guard.validation.js";

export class GuardController {
    constructor() {
        this.guardService = new GuardService();
    }

    /**
     * Crear un nuevo guardia - SOLO ADMIN
     */
    createGuard = async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden crear guardias"
                });
            }

            // Validar datos
            const { error, value } = validateCreateGuard(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Error de validación",
                    errors: error.details.map(err => err.message)
                });
            }

            // Agregar información de la request
            const guardDataWithRequest = {
                ...value,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            };

      
            const result = await this.guardService.createGuard(
                guardDataWithRequest, 
                req.user.id
            );
            
          
            res.status(201).json(result);

        } catch (error) {
            console.error("Error creando guardia:", error);
            
            if (error.message.includes('ya existe')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: error.message || "Error al crear el guardia"
            });
        }
    };


    /**
     * Obtener todos los guardias - ADMIN Y GUARDIA
     */
    getAllGuards = async (req, res) => {
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
    };

    /**
     * Obtener guardia por ID - ADMIN Y GUARDIA (solo su propio perfil o admin)
     */
    getGuardById = async (req, res) => {
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
    };

    /**
     * Actualizar guardia - ADMIN (todo) o GUARDIA (solo campos permitidos)
     */
    updateGuard = async (req, res) => {
        try {
            const guardId = parseInt(req.params.id);
            
            const { error, value } = validateUpdateGuard(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Error de validación",
                    errors: error.details.map(err => err.message)
                });
            }

            const updatedGuard = await this.guardService.updateGuard(
                guardId, 
                value, 
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
    };

    /**
     * Cambiar disponibilidad - ADMIN y el propio guardia
     */
    toggleAvailability = async (req, res) => {
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
    };

    /**
     * Desactivar guardia - SOLO ADMIN
     */
    deactivateGuard = async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden desactivar guardias"
                });
            }

            const guardId = parseInt(req.params.id);
            
            const result = await this.guardService.deactivateGuard(guardId);
            
            res.status(200).json({
                success: true,
                message: result.message,
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
    };

    /**
     * Activar guardia - SOLO ADMIN
     */
    activateGuard = async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden activar guardias"
                });
            }

            const guardId = parseInt(req.params.id);
            
            const guard = await this.guardService.activateGuard(guardId);
            
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
    };

    /**
     * Obtener estadísticas del guardia - ADMIN Y GUARDIA (solo su propio perfil)
     */
    getGuardStats = async (req, res) => {
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
    };

    async toggleAvailability(req, res) {
    try {
        const { id } = req.params;
        const { isAvailable } = req.body;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;
        
        // Si es guardia, verificar que solo edite su propio perfil
        if (currentUserRole === 'guardia') {
            const guard = await guardService.getGuardById(id);
            if (guard.userId !== currentUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes cambiar tu propia disponibilidad'
                });
            }
        }
        
        const result = await guardService.toggleAvailability(id, isAvailable);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

    /**
     * Buscar guardias disponibles - ADMIN Y GUARDIA
     */
    findAvailableGuards = async (req, res) => {
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
    };
}

export default new GuardController();