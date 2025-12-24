// controllers/guardAssignment.controller.js - VERSIÓN COMPLETA Y CORREGIDA
import { GuardAssignmentService } from "../services/guardAssignment.service.js";
import { validateCreateAssignment } from "../validations/guardAssignment.validation.js";

export class GuardAssignmentController {
    constructor() {
        this.guardAssignmentService = new GuardAssignmentService();
    }

    /**
     * Crear nueva asignación - SOLO ADMIN
     */
 create = async (req, res) => {
    try {
        // DEBUG EXTENDIDO
        console.log('🔍 ========== DEBUG DETALLADO ==========');
        console.log('1. Headers completos:', JSON.stringify(req.headers, null, 2));
        console.log('2. Authorization header:', req.headers.authorization);
        console.log('3. req.user completo:', JSON.stringify(req.user, null, 2));
        console.log('4. req.user.id:', req.user?.id);
        console.log('5. req.user.userId:', req.user?.userId);
        console.log('6. req.user.role:', req.user?.role);
        console.log('7. Método HTTP:', req.method);
        console.log('8. URL:', req.url);
        console.log('========================================');
        
        // 1. Verificar que el usuario esté autenticado y sea admin
        if (!req.user) {
            console.log('❌ ERROR: req.user es null/undefined');
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        // Normalizar el ID
        const userId = req.user.id || req.user.userId || req.user.sub;
        console.log('🔍 ID normalizado:', userId);
        
        if (!userId) {
            console.log('❌ ERROR: No se pudo extraer ID de req.user');
            console.log('❌ req.user estructura:', Object.keys(req.user || {}));
            return res.status(400).json({
                success: false,
                message: "No se pudo identificar al usuario",
                debug_info: { user_structure: req.user }
            });
        }

        // Asignar el ID normalizado
        req.user.id = userId;
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Solo los administradores pueden asignar guardias"
            });
        }

        // 2. Validar datos
        console.log('🔍 Body recibido:', req.body);
        const { error, value } = validateCreateAssignment(req.body);
        if (error) {
            console.log('❌ Error de validación:', error.details);
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                errors: error.details.map(err => err.message)
            });
        }

        // 3. Usar el ID normalizado
        const assignedByUserId = req.user.id;
        console.log('✅ assignedByUserId definitivo:', assignedByUserId);
        console.log('✅ Tipo de assignedByUserId:', typeof assignedByUserId);

        // 4. Crear asignación
        console.log('📝 Llamando a createAssignment con:', {
            value,
            assignedByUserId
        });
        
        const result = await this.guardAssignmentService.createAssignment(
            value,
            assignedByUserId
        );

        console.log('✅ Asignación creada exitosamente');
        res.status(201).json(result);

    } catch (error) {
        console.error("❌ ERROR EN CREATE ASSIGNMENT:");
        console.error("❌ Mensaje:", error.message);
        console.error("❌ Stack:", error.stack);
        console.error("❌ Error completo:", error);
        
        if (error.message.includes('violates not-null constraint')) {
            console.error('❌ ERROR DE BASE DE DATOS: Campo required es NULL');
            console.error('❌ Verificar que assigned_by tenga valor:', req.user?.id);
            return res.status(400).json({
                success: false,
                message: "Error en base de datos: Falta información del usuario asignador",
                debug: {
                    assignedByUserId: req.user?.id,
                    userStructure: req.user
                }
            });
        }
            res.status(500).json({
                success: false,
                message: error.message || "Error al asignar guardia"
            });
        }
    };

    /**
     * Verificar disponibilidad en un horario
     */
    checkAvailability = async (req, res) => {
        try {
            const { bikerackId, dayOfWeek, startTime, endTime } = req.query;
            
            if (!bikerackId || !dayOfWeek || !startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    message: "Se requieren: bikerackId, dayOfWeek, startTime, endTime"
                });
            }

            const availability = await this.guardAssignmentService.checkAvailability(
                parseInt(bikerackId),
                dayOfWeek,
                startTime,
                endTime
            );

            res.status(200).json({
                success: true,
                data: availability
            });

        } catch (error) {
            console.error("Error verificando disponibilidad:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * Obtener horario semanal de un guardia
     */
    getGuardSchedule = async (req, res) => {
        try {
            const { guardId } = req.params;
            
            // Validar permisos: admin puede ver todos, guardia solo su propio horario
            if (req.user.role !== 'admin' && req.user.id !== parseInt(guardId)) {
                return res.status(403).json({
                    success: false,
                    message: "Solo puedes ver tu propio horario"
                });
            }

            const schedule = await this.guardAssignmentService.getGuardWeeklySchedule(
                parseInt(guardId)
            );

            // Formatear respuesta
            const formattedSchedule = {};
            for (let day = 0; day < 7; day++) {
                const dayName = this.guardAssignmentService.getDayName(day);
                formattedSchedule[dayName] = schedule[day];
            }

            res.status(200).json({
                success: true,
                data: formattedSchedule
            });

        } catch (error) {
            console.error("Error obteniendo horario:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * Obtener horario semanal de un bicicletero
     */
    getBikerackSchedule = async (req, res) => {
        try {
            const { bikerackId } = req.params;

            const schedule = await this.guardAssignmentService.getBikerackWeeklySchedule(
                parseInt(bikerackId)
            );

            // Formatear respuesta
            const formattedSchedule = {};
            for (let day = 0; day < 7; day++) {
                const dayName = this.guardAssignmentService.getDayName(day);
                formattedSchedule[dayName] = schedule[day];
            }

            res.status(200).json({
                success: true,
                data: formattedSchedule
            });

        } catch (error) {
            console.error("Error obteniendo horario:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * Obtener todas las asignaciones activas
     */
    getAllActiveAssignments = async (req, res) => {
        try {
            const assignments = await this.guardAssignmentService.getAllActiveAssignments();
            res.json({
                success: true,
                count: assignments.length,
                data: assignments
            });
        } catch (error) {
            console.error("Error obteniendo asignaciones:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * Obtener asignación por ID
     */
    getAssignmentById = async (req, res) => {
        try {
            const assignment = await this.guardAssignmentService.getAssignmentById(req.params.id);
            
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: "Asignación no encontrada"
                });
            }

            // Validar permisos: admin puede ver todo, guardia solo sus propias asignaciones
            if (req.user.role !== 'admin' && req.user.id !== assignment.guard?.userId) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para ver esta asignación"
                });
            }

            res.json({
                success: true,
                data: assignment
            });
        } catch (error) {
            console.error("Error obteniendo asignación:", error);
            
            if (error.message.includes('no encontrad')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * Actualizar asignación - SOLO ADMIN
     */
    update = async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden actualizar asignaciones"
                });
            }

            const updated = await this.guardAssignmentService.updateAssignment(
                req.params.id, 
                req.body
            );
            
            res.json({
                success: true,
                message: 'Asignación actualizada',
                data: updated
            });
        } catch (error) {
            console.error("Error actualizando asignación:", error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * Desactivar asignación - SOLO ADMIN
     */
    deactivate = async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden desactivar asignaciones"
                });
            }

            await this.guardAssignmentService.deactivateAssignment(req.params.id);
            
            res.json({
                success: true,
                message: 'Asignación desactivada'
            });
        } catch (error) {
            console.error("Error desactivando asignación:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * Obtener asignaciones por bicicletero
     */
    getByBikerack = async (req, res) => {
        try {
            const assignments = await this.guardAssignmentService.getAssignmentsByBikerack(
                req.params.bikerackId
            );
            
            res.json({
                success: true,
                count: assignments.length,
                data: assignments
            });
        } catch (error) {
            console.error("Error obteniendo asignaciones por bicicletero:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * Obtener asignaciones por guardia
     */
    getByGuard = async (req, res) => {
        try {
            const guardId = req.params.guardId;
            
            // Validar permisos: admin puede ver todo, guardia solo sus propias asignaciones
            if (req.user.role !== 'admin' && req.user.id !== parseInt(guardId)) {
                return res.status(403).json({
                    success: false,
                    message: "Solo puedes ver tus propias asignaciones"
                });
            }

            const assignments = await this.guardAssignmentService.getAssignmentsByGuard(guardId);
            
            res.json({
                success: true,
                count: assignments.length,
                data: assignments
            });
        } catch (error) {
            console.error("Error obteniendo asignaciones por guardia:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };
}