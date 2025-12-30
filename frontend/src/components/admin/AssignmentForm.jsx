// frontend/src/components/admin/AssignmentForm.jsx - VERSIÓN ESTÉTICA
import { useState, useEffect } from 'react';
import  apiService  from '../../services/api.service';
import { getToken } from '../../services/auth.service';
import { Alert } from '../admin/common/Alert';
import { ConfirmModal } from '../admin/common/ConfirmModal';
import "../../styles/animations.css";

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
        { value: 'lunes', label: 'Lun', emoji: '📅' },
        { value: 'martes', label: 'Mar', emoji: '📅' },
        { value: 'miércoles', label: 'Mié', emoji: '📅' },
        { value: 'jueves', label: 'Jue', emoji: '📅' },
        { value: 'viernes', label: 'Vie', emoji: '📅' },
        { value: 'sábado', label: 'Sáb', emoji: '📅' },
        { value: 'domingo', label: 'Dom', emoji: '📅' }
    ];

    const timeOptions = [
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    useEffect(() => {
        const schedule = `${formData.startTime} - ${formData.endTime} (${selectedDays.join(', ')})`;
        setFormData(prev => ({ ...prev, schedule }));
    }, [formData.startTime, formData.endTime, selectedDays]);

    useEffect(() => {
        setBackendError(null);
    }, [formData, selectedDays]);

    const showAlertMessage = (type, title, message, duration = 5000) => {
        setAlertConfig({ type, title, message, duration });
        setShowAlert(true);
    };

    const showConfirmMessage = (title, message, onConfirm, type = 'warning') => {
        setConfirmConfig({ title, message, onConfirm, type });
        setShowConfirm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        setBackendError(null);
    };

    const handleDayToggle = (day) => {
        const newSelectedDays = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day];
        
        setSelectedDays(newSelectedDays);
        setFormData(prev => ({ ...prev, workDays: newSelectedDays.join(',') }));
        if (errors.days) setErrors(prev => ({ ...prev, days: '' }));
        setBackendError(null);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.bikerackId) newErrors.bikerackId = 'Seleccione un bicicletero';
        if (!formData.startTime || !formData.endTime) {
            newErrors.time = 'Seleccione horario completo';
        } else if (formData.startTime >= formData.endTime) {
            newErrors.time = 'La hora de inicio debe ser anterior a la hora de fin';
        }
        if (selectedDays.length === 0) newErrors.days = 'Seleccione al menos un día';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBackendError(null);
        
        if (!validateForm()) {
            showAlertMessage('warning', 'Campos incompletos', 'Complete todos los campos requeridos');
            return;
        }
        
        try {
            setIsSubmitting(true);
            
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
            
            let response;
            if (isEditMode) {
                response = await updateAssignment(assignmentToEdit.id, submissionData, token);
            } else {
                response = await apiService.createAssignment(submissionData, token);
            }
            
            if (response.success) {
                showAlertMessage(
                    'success',
                    isEditMode ? '✅ Actualizado' : '✅ Creado',
                    isEditMode ? 'Horario actualizado exitosamente' : 'Horario asignado exitosamente'
                );
                
                setTimeout(() => {
                    onCancel();
                    if (onAssignmentUpdated) onAssignmentUpdated();
                }, 1500);
            } else {
                const errorMessage = response.message || response.error || 'Error desconocido';
                setBackendError(errorMessage);
                showAlertMessage('error', '❌ Error', errorMessage);
            }
        } catch (err) {
            const errorMsg = err.message || 'Error de conexión';
            setBackendError(errorMsg);
            showAlertMessage('error', '❌ Error del sistema', errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateAssignment = async (assignmentId, assignmentData, token) => {
         try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/guard-assignments/${assignmentId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(assignmentData)
            }
        );
 if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        return { success: false, message: error.message || 'Error de conexión' };
    }
};
  const handleDelete = async () => {
    showConfirmMessage(
        '🗑️ Eliminar asignación',
        '¿Seguro que deseas eliminar esta asignación?',
        async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/guard-assignments/${assignmentToEdit.id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || 'Error desconocido');
                    }
                    
                    const data = await response.json().catch(() => ({ success: true }));
                    
                    if (data.success) {
                        showAlertMessage('success', '✅ Eliminado', 'Asignación eliminada exitosamente');
                        setTimeout(() => {
                            onCancel();
                            if (onAssignmentUpdated) onAssignmentUpdated();
                        }, 1500);
                    }
                } catch (err) {
                    showAlertMessage('error', '❌ Error', err.message);
                }
            },
            'danger'
        );
    };

    // 🎨 ESTILOS MEJORADOS
    const styles = {
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        },
        editModeBanner: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '8px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        },
        editModeTitle: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '4px'
        },
        editModeSubtitle: {
            fontSize: '13px',
            opacity: '0.9'
        },
        backendError: {
            display: 'flex',
            gap: '12px',
            padding: '16px',
            background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
            borderRadius: '12px',
            border: '2px solid #f48771',
            animation: 'shake 0.5s'
        },
        backendErrorIcon: {
            fontSize: '24px',
            flexShrink: 0
        },
        backendErrorContent: {
            flex: 1
        },
        backendErrorTitle: {
            fontSize: '15px',
            fontWeight: '600',
            color: '#c53030',
            marginBottom: '8px'
        },
        backendErrorMessage: {
            fontSize: '14px',
            color: '#742a2a',
            marginBottom: '8px',
            lineHeight: '1.5'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        formLabel: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        labelIcon: {
            fontSize: '18px'
        },
        formSelect: {
            padding: '12px 16px',
            fontSize: '14px',
            border: '2px solid #e2e8f0',
            borderRadius: '10px',
            backgroundColor: 'white',
            color: '#2d3748',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
            fontFamily: 'inherit'
        },
        formInput: {
            padding: '12px 16px',
            fontSize: '14px',
            border: '2px solid #e2e8f0',
            borderRadius: '10px',
            backgroundColor: 'white',
            color: '#2d3748',
            transition: 'all 0.3s ease',
            outline: 'none',
            fontFamily: 'inherit'
        },
        formError: {
            fontSize: '13px',
            color: '#e53e3e',
            fontWeight: '500',
            marginTop: '-4px'
        },
        formHint: {
            fontSize: '12px',
            color: '#718096',
            marginTop: '-4px'
        },
        timeRow: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
        },
        daysGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gap: '10px'
        },
        dayButton: {
            padding: '12px 8px',
            border: '2px solid #e2e8f0',
            borderRadius: '10px',
            backgroundColor: 'white',
            color: '#4a5568',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            outline: 'none'
        },
        dayButtonActive: {
            backgroundColor: '#4361ee',
            color: 'white',
            borderColor: '#4361ee',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(67, 97, 238, 0.3)'
        },
        previewCard: {
            background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)',
            padding: '16px',
            borderRadius: '12px',
            border: '2px dashed #cbd5e0'
        },
        previewTitle: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#4a5568',
            marginBottom: '8px'
        },
        previewText: {
            fontSize: '15px',
            color: '#2d3748',
            fontWeight: '500'
        },
        formActions: {
            display: 'flex',
            gap: '10px',
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '2px solid #e2e8f0'
        },
        btn: {
            flex: 1,
            padding: '14px 20px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            outline: 'none',
            fontFamily: 'inherit'
        },
        btnPrimary: {
            background: 'linear-gradient(135deg, #4361ee 0%, #3651d4 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(67, 97, 238, 0.3)'
        },
        btnSecondary: {
            backgroundColor: '#e2e8f0',
            color: '#4a5568'
        },
        btnDanger: {
            background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(245, 101, 101, 0.3)',
            flex: '0 0 auto',
            minWidth: '120px'
        },
        spinner: {
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} style={styles.form}>
                {isEditMode && (
                    <div style={styles.editModeBanner}>
                        <div style={styles.editModeTitle}>✏️ Editando asignación</div>
                        <div style={styles.editModeSubtitle}>
                            ID: {assignmentToEdit.id} · {new Date(assignmentToEdit.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                )}

                {backendError && (
                    <div style={styles.backendError}>
                        <div style={styles.backendErrorIcon}>⚠️</div>
                        <div style={styles.backendErrorContent}>
                            <div style={styles.backendErrorTitle}>Error del servidor</div>
                            <div style={styles.backendErrorMessage}>{backendError}</div>
                        </div>
                    </div>
                )}

                {/* Bicicletero */}
                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                        <span style={styles.labelIcon}>🚲</span>
                        Bicicletero
                    </label>
                    <select
                        name="bikerackId"
                        value={formData.bikerackId}
                        onChange={handleChange}
                        style={{
                            ...styles.formSelect,
                            borderColor: errors.bikerackId ? '#e53e3e' : '#e2e8f0'
                        }}
                        disabled={isSubmitting}
                        onMouseOver={(e) => !isSubmitting && (e.target.style.borderColor = '#4361ee')}
                        onMouseOut={(e) => !isSubmitting && !errors.bikerackId && (e.target.style.borderColor = '#e2e8f0')}
                    >
                        <option value="">Selecciona un bicicletero</option>
                        {bikeracks.map(bikerack => (
                            <option key={bikerack.id} value={bikerack.id}>
                                📍 {bikerack.name} - {bikerack.location} (Cap: {bikerack.capacity})
                            </option>
                        ))}
                    </select>
                    {errors.bikerackId && <span style={styles.formError}>{errors.bikerackId}</span>}
                    {!errors.bikerackId && (
                        <span style={styles.formHint}>
                            {bikeracks.length} bicicleteros disponibles
                        </span>
                    )}
                </div>

                {/* Horarios */}
                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                        <span style={styles.labelIcon}>🕐</span>
                        Horario
                    </label>
                    <div style={styles.timeRow}>
                        <div>
                            <select
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                style={styles.formSelect}
                                disabled={isSubmitting}
                                onMouseOver={(e) => !isSubmitting && (e.target.style.borderColor = '#4361ee')}
                                onMouseOut={(e) => !isSubmitting && (e.target.style.borderColor = '#e2e8f0')}
                            >
                                {timeOptions.map(time => (
                                    <option key={time} value={time}>🌅 {time}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                style={styles.formSelect}
                                disabled={isSubmitting}
                                onMouseOver={(e) => !isSubmitting && (e.target.style.borderColor = '#4361ee')}
                                onMouseOut={(e) => !isSubmitting && (e.target.style.borderColor = '#e2e8f0')}
                            >
                                {timeOptions.map(time => (
                                    <option key={time} value={time}>🌆 {time}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {errors.time && <span style={styles.formError}>{errors.time}</span>}
                </div>

                {/* Días de la semana */}
                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                        <span style={styles.labelIcon}>📅</span>
                        Días de trabajo
                    </label>
                    <div style={styles.daysGrid}>
                        {daysOfWeek.map(day => (
                            <button
                                key={day.value}
                                type="button"
                                onClick={() => handleDayToggle(day.value)}
                                disabled={isSubmitting}
                                style={{
                                    ...styles.dayButton,
                                    ...(selectedDays.includes(day.value) && styles.dayButtonActive)
                                }}
                                onMouseOver={(e) => {
                                    if (!isSubmitting && !selectedDays.includes(day.value)) {
                                        e.target.style.borderColor = '#4361ee';
                                        e.target.style.transform = 'scale(1.05)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isSubmitting && !selectedDays.includes(day.value)) {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.transform = 'scale(1)';
                                    }
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{day.emoji}</span>
                                <span>{day.label}</span>
                            </button>
                        ))}
                    </div>
                    {errors.days && <span style={styles.formError}>{errors.days}</span>}
                    {!errors.days && (
                        <span style={styles.formHint}>
                            {selectedDays.length} día{selectedDays.length !== 1 ? 's' : ''} seleccionado{selectedDays.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Vista previa */}
                <div style={styles.previewCard}>
                    <div style={styles.previewTitle}>📋 Resumen de la asignación</div>
                    <div style={styles.previewText}>{formData.schedule || 'Selecciona horario y días'}</div>
                </div>

                {/* Botones */}
                <div style={styles.formActions}>
                    {isEditMode && (
                        <button 
                            type="button" 
                            onClick={handleDelete}
                            style={styles.btnDanger}
                            disabled={isSubmitting}
                            onMouseOver={(e) => !isSubmitting && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseOut={(e) => !isSubmitting && (e.target.style.transform = 'translateY(0)')}
                        >
                            🗑️ Eliminar
                        </button>
                    )}
                    
                    <button 
                        type="button" 
                        onClick={onCancel}
                        style={styles.btnSecondary}
                        disabled={isSubmitting}
                        onMouseOver={(e) => !isSubmitting && (e.target.style.backgroundColor = '#cbd5e0')}
                        onMouseOut={(e) => !isSubmitting && (e.target.style.backgroundColor = '#e2e8f0')}
                    >
                        Cancelar
                    </button>
                    
                    <button 
                        type="submit"
                        disabled={isSubmitting || !formData.bikerackId || selectedDays.length === 0}
                        style={{
                            ...styles.btnPrimary,
                            opacity: (isSubmitting || !formData.bikerackId || selectedDays.length === 0) ? 0.5 : 1,
                            cursor: (isSubmitting || !formData.bikerackId || selectedDays.length === 0) ? 'not-allowed' : 'pointer'
                        }}
                        onMouseOver={(e) => {
                            if (!isSubmitting && formData.bikerackId && selectedDays.length > 0) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(67, 97, 238, 0.4)';
                            }
                        }}
                        onMouseOut={(e) => {
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
                            <>
                                {isEditMode ? '💾 Actualizar' : '✅ Asignar'}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {showAlert && (
                <Alert
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    onClose={() => setShowAlert(false)}
                    duration={alertConfig.duration}
                />
            )}

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

export default AssignmentForm;