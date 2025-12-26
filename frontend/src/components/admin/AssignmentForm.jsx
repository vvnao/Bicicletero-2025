// frontend/src/components/admin/AssignmentForm.jsx (MODIFICADO CON ALERTAS ESTÉTICAS)
import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { getToken } from '../../services/auth.service';
import { Alert } from '../admin/common/Alert';
import { ConfirmModal } from '../admin/common/ConfirmModal';

const AssignmentForm = ({ 
    guardId, 
    bikeracks = [], 
    onSubmit, 
    onCancel, 
    existingAssignments = [],
    assignmentToEdit = null,
    onAssignmentUpdated
}) => {
    const isEditMode = !!assignmentToEdit;
    
    // Estados para alertas
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({});
    
    const [formData, setFormData] = useState({
        guardId: guardId || '',
        bikerackId: assignmentToEdit?.bikerackId || assignmentToEdit?.bikerack?.id || '',
        startTime: assignmentToEdit?.startTime || '08:00',
        endTime: assignmentToEdit?.endTime || '17:00',
        schedule: assignmentToEdit?.schedule || '',
        workDays: assignmentToEdit?.workDays || 'lunes,martes,miércoles,jueves,viernes',
        maxHoursPerWeek: assignmentToEdit?.maxHoursPerWeek || 40
    });

    const [errors, setErrors] = useState({});
    const [backendError, setBackendError] = useState(null);
    const [selectedDays, setSelectedDays] = useState(
        assignmentToEdit?.workDays ? assignmentToEdit.workDays.split(',') : 
        ['lunes', 'martes', 'miércoles', 'jueves', 'viernes']
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = getToken();

    const daysOfWeek = [
        { value: 'lunes', label: 'Lunes' },
        { value: 'martes', label: 'Martes' },
        { value: 'miércoles', label: 'Miércoles' },
        { value: 'jueves', label: 'Jueves' },
        { value: 'viernes', label: 'Viernes' },
        { value: 'sábado', label: 'Sábado' },
        { value: 'domingo', label: 'Domingo' }
    ];

    const timeOptions = [
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    // Calcular horario general automáticamente
    useEffect(() => {
        const schedule = `${formData.startTime} - ${formData.endTime} (${selectedDays.join(', ')})`;
        setFormData(prev => ({ ...prev, schedule }));
    }, [formData.startTime, formData.endTime, selectedDays]);

    // Resetear errores del backend al cambiar campos
    useEffect(() => {
        setBackendError(null);
    }, [formData, selectedDays]);

    // Función para mostrar alertas
    const showAlertMessage = (type, title, message, duration = 5000) => {
        setAlertConfig({
            type,
            title,
            message,
            duration
        });
        setShowAlert(true);
    };

    // Función para mostrar confirmación
    const showConfirmMessage = (title, message, onConfirm, type = 'warning') => {
        setConfirmConfig({
            title,
            message,
            onConfirm,
            type
        });
        setShowConfirm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setBackendError(null);
    };

    const handleDayToggle = (day) => {
        const newSelectedDays = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day];
        
        setSelectedDays(newSelectedDays);
        
        setFormData(prev => ({ 
            ...prev, 
            workDays: newSelectedDays.join(',') 
        }));
        
        if (errors.days) {
            setErrors(prev => ({ ...prev, days: '' }));
        }
        setBackendError(null);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.bikerackId) {
            newErrors.bikerackId = 'Seleccione un bicicletero';
        }
        
        if (!formData.startTime || !formData.endTime) {
            newErrors.time = 'Seleccione horario completo';
        } else if (formData.startTime >= formData.endTime) {
            newErrors.time = 'La hora de inicio debe ser anterior a la hora de fin';
        }
        
        if (selectedDays.length === 0) {
            newErrors.days = 'Seleccione al menos un día';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError(null);
    
    if (!validateForm()) {
        showAlertMessage('warning', 'Campos incompletos', 'Por favor, complete todos los campos requeridos correctamente');
        return;
    }
    
    try {
        setIsSubmitting(true);
        
        console.log('📤 Enviando datos al backend:');
        
        // Calcular horas de esta asignación
        const calculateHours = (startTime, endTime, selectedDays) => {
            const start = parseInt(startTime.split(':')[0]);
            const end = parseInt(endTime.split(':')[0]);
            const hoursPerDay = end - start;
            return hoursPerDay * selectedDays.length;
        };
        
        const newAssignmentHours = calculateHours(
            formData.startTime, 
            formData.endTime, 
            selectedDays
        );
        
        console.log(`⏰ Horas de esta asignación: ${newAssignmentHours}h`);
        
        // Si está editando, mostrar info de la asignación anterior
        if (isEditMode) {
            const oldAssignmentHours = calculateHours(
                assignmentToEdit.startTime,
                assignmentToEdit.endTime,
                assignmentToEdit.workDays ? assignmentToEdit.workDays.split(',') : [assignmentToEdit.dayOfWeek]
            );
            console.log(`⏰ Horas asignación anterior: ${oldAssignmentHours}h`);
        }
        
        const submissionData = {
            guardId: formData.guardId,
            bikerackId: formData.bikerackId,
            startTime: formData.startTime,
            endTime: formData.endTime,
            schedule: formData.schedule,
            maxHoursPerWeek: formData.maxHoursPerWeek,
            workDays: selectedDays.join(','),
            dayOfWeek: selectedDays[0] || 'lunes'
        };
        
        console.log('Datos a enviar:', submissionData);
        
        let response;
        
        if (isEditMode) {
            response = await updateAssignment(assignmentToEdit.id, submissionData, token);
        } else {
            response = await apiService.createAssignment(submissionData, token);
        }
        
        console.log('📥 Respuesta del backend:', response);
        
        if (response.success) {
            showAlertMessage(
                'success',
                isEditMode ? '✅ Asignación actualizada' : '✅ Asignación creada',
                isEditMode ? 'El horario ha sido actualizado exitosamente' : 'El nuevo horario ha sido asignado exitosamente'
            );
            
            setTimeout(() => {
                onCancel();
                if (onAssignmentUpdated) {
                    onAssignmentUpdated();
                }
            }, 1500);
            
        } else {
            let errorMessage;
            
            if (response.message) {
                errorMessage = response.message;
            } else if (response.error) {
                errorMessage = response.error;
            } else if (response.errors) {
                if (typeof response.errors === 'object') {
                    errorMessage = Object.entries(response.errors)
                        .map(([field, msg]) => `${field}: ${msg}`)
                        .join('\n');
                } else {
                    errorMessage = JSON.stringify(response.errors);
                }
            } else {
                errorMessage = 'Error desconocido del servidor';
            }
            
            // Manejo especial para el error de horas
            if (errorMessage.includes('excede su límite de horas semanales')) {
                // Extraer información del error
                const match = errorMessage.match(/Actual: (\d+)h, Límite: (\d+)h/);
                if (match) {
                    const actualHours = parseInt(match[1]);
                    const limitHours = parseInt(match[2]);
                    
                    setBackendError(errorMessage);
                    
                    showAlertMessage('warning', '⚠️ Límite de horas excedido', 
                        `Este guardia ya tiene ${actualHours}h de ${limitHours}h permitidas semanalmente.\n\n` +
                        `Solución: \n` +
                        `1. Reduce las horas de esta asignación\n` +
                        `2. Elimina otras asignaciones\n` +
                        `3. Aumenta el límite en "Horas máximas por semana"`
                    );
                } else {
                    setBackendError(errorMessage);
                    showAlertMessage('error', '❌ Error de horas', errorMessage);
                }
            } else {
                setBackendError(errorMessage);
                showAlertMessage('error', '❌ Error de validación', errorMessage);
            }
            
            console.error('Error del backend completo:', response);
        }
    } catch (err) {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} assignment:`, err);
        const errorMsg = err.message || 'Error de conexión con el servidor';
        setBackendError(errorMsg);
        showAlertMessage('error', '❌ Error del sistema', errorMsg);
    } finally {
        setIsSubmitting(false);
    }
};

  const updateAssignment = async (assignmentId, assignmentData, token) => {
    try {
        const response = await fetch(`http://localhost:3000/api/guard-assignments/${assignmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(assignmentData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en updateAssignment:', error);
        return { 
            success: false, 
            message: error.message || 'Error de conexión'
        };
    }
};
    const handleDelete = async () => {
    showConfirmMessage(
        '🗑️ Eliminar asignación',
        '¿Estás seguro de eliminar esta asignación? Esta acción no se puede deshacer.',
        async () => {
            try {
                console.log('🗑️ Intentando eliminar asignación ID:', assignmentToEdit.id);
                
                // Opción 1: Usando tu apiService (si lo tienes configurado)
                // const response = await apiService.deleteAssignment(assignmentToEdit.id, token);
                
                // Opción 2: Usando fetch directamente
                const response = await fetch(`http://localhost:3000/api/guard-assignments/${assignmentToEdit.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                // Verificar si la respuesta fue exitosa
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`HTTP ${response.status}: ${errorData.message || 'Error desconocido'}`);
                }
                
                // Intentar parsear la respuesta
                const data = await response.json().catch(() => {
                    // Si no hay JSON en la respuesta, crear un objeto éxito
                    return { success: true, message: 'Asignación eliminada' };
                });
                
                console.log('✅ Respuesta del servidor:', data);
                
                if (data.success) {
                    showAlertMessage('success', '✅ Asignación eliminada', 
                        'La asignación ha sido eliminada exitosamente');
                    
                    // Cerrar el modal y actualizar
                    setTimeout(() => {
                        onCancel();
                        if (onAssignmentUpdated) {
                            onAssignmentUpdated();
                        }
                    }, 1500);
                } else {
                    showAlertMessage('error', '❌ Error al eliminar', 
                        data.message || 'No se pudo eliminar la asignación');
                }
            } catch (err) {
                console.error('❌ Error completo al eliminar:', err);
                showAlertMessage('error', '❌ Error del sistema', 
                    `Error: ${err.message || 'No se pudo eliminar la asignación'}`);
            }
        },
        'danger'
    );
};

    // Estilos CSS en línea
    const styles = {
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        editModeBanner: {
            background: 'linear-gradient(135deg, #e8f4fd 0%, #d4eafc 100%)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '10px',
            borderLeft: '4px solid #3498db'
        },
        editModeTitle: {
            fontWeight: '600',
            color: '#2980b9',
            fontSize: '15px',
            marginBottom: '5px'
        },
        editModeSubtitle: {
            fontSize: '12px',
            color: '#3498db'
        },
        backendError: {
            background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
            padding: '15px',
            borderRadius: '8px',
            borderLeft: '4px solid #e74c3c',
            display: 'flex',
            gap: '12px',
            color: '#721c24'
        },
        backendErrorIcon: {
            fontSize: '24px',
            flexShrink: 0
        },
        backendErrorContent: {
            flex: 1
        },
        backendErrorTitle: {
            fontWeight: '600',
            fontSize: '15px',
            marginBottom: '5px',
            color: '#c0392b'
        },
        backendErrorMessage: {
            fontSize: '13px',
            marginBottom: '10px',
            padding: '8px',
            background: 'rgba(231, 76, 60, 0.1)',
            borderRadius: '4px',
            color: '#e74c3c'
        },
        backendErrorHint: {
            fontSize: '12px',
            color: '#7f8c8d'
        },
        backendErrorList: {
            margin: '5px 0 0 20px',
            padding: 0
        },
        backendErrorItem: {
            marginBottom: '3px'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        formLabel: {
            fontWeight: '600',
            color: '#2c3e50',
            fontSize: '14px'
        },
        formHint: {
            fontSize: '12px',
            color: '#7f8c8d'
        },
        formInput: {
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e0e6ed',
            fontSize: '14px',
            background: 'white',
            transition: 'all 0.3s ease',
            width: '100%',
            boxSizing: 'border-box'
        },
        formSelect: {
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #e0e6ed',
            fontSize: '14px',
            background: 'white',
            transition: 'all 0.3s ease',
            width: '100%',
            boxSizing: 'border-box'
        },
        timeSelector: {
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '12px',
            alignItems: 'end'
        },
        timeField: {
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
        },
        timeLabel: {
            fontSize: '12px',
            color: '#6c757d'
        },
        timeSeparator: {
            textAlign: 'center',
            paddingBottom: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#6c757d'
        },
        schedulePreview: {
            marginTop: '10px',
            padding: '12px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '8px',
            border: '2px solid #bae6fd'
        },
        scheduleLabel: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#0369a1',
            marginBottom: '4px'
        },
        scheduleValue: {
            fontSize: '15px',
            fontWeight: '700',
            color: '#0c4a6e'
        },
        daysSelector: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '5px'
        },
        dayButton: {
            padding: '10px 16px',
            borderRadius: '25px',
            border: '2px solid #e2e8f0',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'white',
            color: '#4a5568',
            fontWeight: 400,
            minWidth: '80px',
            flex: 1
        },
        dayButtonSelected: {
            background: 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)',
            color: 'white',
            borderColor: '#4361ee',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(67, 97, 238, 0.3)'
        },
        selectedDaysDisplay: {
            fontSize: '14px',
            color: '#2d3748',
            marginTop: '10px',
            fontWeight: 500,
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '6px'
        },
        formError: {
            color: '#e74c3c',
            fontSize: '12px',
            marginTop: '4px'
        },
        formActions: {
            display: 'flex',
            gap: '12px',
            marginTop: '20px'
        },
        btn: {
            padding: '14px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px',
            transition: 'all 0.3s ease',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        btnPrimary: {
            background: 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(67, 97, 238, 0.3)'
        },
        btnSecondary: {
            background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
            color: 'white'
        },
        btnDanger: {
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            color: 'white'
        },
        spinner: {
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            borderTopColor: 'white',
            animation: 'spin 1s ease-in-out infinite'
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} style={styles.form}>
                {/* Título diferente para edición */}
                {isEditMode && (
                    <div style={styles.editModeBanner}>
                        <div style={styles.editModeTitle}>
                            📝 Editando asignación existente
                        </div>
                        <div style={styles.editModeSubtitle}>
                            ID: {assignmentToEdit.id} | Creada: {new Date(assignmentToEdit.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                )}

                {/* Mostrar error del backend si existe */}
                {backendError && (
                    <div style={styles.backendError}>
                        <div style={styles.backendErrorIcon}>⚠️</div>
                        <div style={styles.backendErrorContent}>
                            <div style={styles.backendErrorTitle}>Error del servidor</div>
                            <div style={styles.backendErrorMessage}>{backendError}</div>
                            <div style={styles.backendErrorHint}>
                                Por favor, verifica que:
                                <ul style={styles.backendErrorList}>
                                    <li style={styles.backendErrorItem}>El bicicletero no esté ya ocupado en ese horario</li>
                                    <li style={styles.backendErrorItem}>El guardia no tenga conflictos de horario</li>
                                    <li style={styles.backendErrorItem}>Los datos estén en el formato correcto</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                        Bicicletero *
                    </label>
                    <select
                        name="bikerackId"
                        value={formData.bikerackId}
                        onChange={handleChange}
                        style={styles.formSelect}
                        disabled={isSubmitting}
                    >
                        <option value="">Seleccione un bicicletero</option>
                        {bikeracks.map(bikerack => (
                            <option key={bikerack.id} value={bikerack.id}>
                                {bikerack.name} (Capacidad: {bikerack.capacity})
                            </option>
                        ))}
                    </select>
                    {errors.bikerackId && <span style={styles.formError}>{errors.bikerackId}</span>}
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                        Horario *
                    </label>
                    <div style={styles.timeSelector}>
                        <div style={styles.timeField}>
                            <div style={styles.timeLabel}>Hora inicio</div>
                            <select
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                style={styles.formSelect}
                                disabled={isSubmitting}
                            >
                                {timeOptions.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.timeSeparator}>a</div>
                        <div style={styles.timeField}>
                            <div style={styles.timeLabel}>Hora fin</div>
                            <select
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                style={styles.formSelect}
                                disabled={isSubmitting}
                            >
                                {timeOptions.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {errors.time && <span style={styles.formError}>{errors.time}</span>}
                    
                    {formData.schedule && (
                        <div style={styles.schedulePreview}>
                            <div style={styles.scheduleLabel}>Horario general:</div>
                            <div style={styles.scheduleValue}>{formData.schedule}</div>
                        </div>
                    )}
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                        Días laborales *
                    </label>
                    <div style={styles.formHint}>
                        Selecciona los días en que trabajará el guardia
                    </div>
                    <div style={styles.daysSelector}>
                        {daysOfWeek.map(day => (
                            <button
                                key={day.value}
                                type="button"
                                onClick={() => handleDayToggle(day.value)}
                                disabled={isSubmitting}
                                style={{
                                    ...styles.dayButton,
                                    ...(selectedDays.includes(day.value) && styles.dayButtonSelected)
                                }}
                                onMouseEnter={(e) => {
                                    if (!selectedDays.includes(day.value) && !isSubmitting) {
                                        e.target.style.borderColor = '#4361ee';
                                        e.target.style.background = '#f8f9fe';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!selectedDays.includes(day.value) && !isSubmitting) {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.background = 'white';
                                        e.target.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                    {errors.days && <span style={styles.formError}>{errors.days}</span>}
                    <div style={styles.selectedDaysDisplay}>
                        📅 Días seleccionados: <span style={{ color: '#4361ee', fontWeight: 600 }}>{selectedDays.join(', ')}</span>
                    </div>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                        Horas máximas por semana
                    </label>
                    <input
                        type="number"
                        name="maxHoursPerWeek"
                        value={formData.maxHoursPerWeek}
                        onChange={handleChange}
                        style={styles.formInput}
                        min="1"
                        max="40"
                        step="1"
                        disabled={isSubmitting}
                    />
                    {errors.maxHoursPerWeek && <span style={styles.formError}>{errors.maxHoursPerWeek}</span>}
                    <div style={styles.formHint}>
                        Límite de horas semanales para este guardia
                    </div>
                </div>

                <div style={styles.formActions}>
                    {isEditMode && (
                        <button 
                            type="button" 
                            onClick={handleDelete}
                            style={{
                                ...styles.btn,
                                ...styles.btnDanger
                            }}
                            disabled={isSubmitting}
                            onMouseEnter={(e) => {
                                if (!isSubmitting) {
                                    e.target.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSubmitting) {
                                    e.target.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            🗑️ Eliminar
                        </button>
                    )}
                    
                    <button 
                        type="button" 
                        onClick={onCancel}
                        style={{
                            ...styles.btn,
                            ...styles.btnSecondary
                        }}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting || !formData.bikerackId || selectedDays.length === 0}
                        style={{
                            ...styles.btn,
                            ...styles.btnPrimary
                        }}
                        onMouseEnter={(e) => {
                            if (!isSubmitting && formData.bikerackId && selectedDays.length > 0) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(67, 97, 238, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSubmitting) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(67, 97, 238, 0.3)';
                            }
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <span style={styles.spinner}></span>
                                Procesando...
                            </>
                        ) : (
                            isEditMode ? 'Actualizar Asignación' : 'Asignar Horario'
                        )}
                    </button>
                </div>
            </form>

            {/* Alertas */}
            {showAlert && (
                <Alert
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    onClose={() => setShowAlert(false)}
                    duration={alertConfig.duration}
                />
            )}

            {/* Confirmación */}
            {showConfirm && (
                <ConfirmModal
                    title={confirmConfig.title}
                    message={confirmConfig.message}
                    onConfirm={() => {
                        confirmConfig.onConfirm();
                        setShowConfirm(false);
                    }}
                    onCancel={() => setShowConfirm(false)}
                    type={confirmConfig.type}
                />
            )}
        </>
    );
};

// Añade estas animaciones al head de tu documento
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes scaleIn {
        from {
            transform: scale(0.9);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

export default AssignmentForm;