// frontend/src/pages/admin/GuardiasAdmin.jsx - VERSIÓN CORREGIDA CON API_URL
import { useState, useEffect } from 'react';
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import { apiService } from '../../services/api.service';
import GuardForm from '../../components/admin/GuardForm';  
import AssignmentForm from '../../components/admin/AssignmentForm';
import { Alert } from '../../components/admin/common/Alert';
import { ConfirmModal } from '../../components/admin/common/ConfirmModal'; 
import { getToken } from '../../services/auth.service';

// URL base desde variable de entorno
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


const GuardiasAdmin = () => {
    const [activeCards, setActiveCards] = useState({});
    const [guardias, setGuardias] = useState([]);
    const [bikeracks, setBikeracks] = useState([]);
    const [assignments, setAssignments] = useState([]);

function BicicletasAdmin() {
    const navigate = useNavigate();
    
    // URL base
    const API_URL = import.meta.env.VITE_API_URL;
    
    // Estados

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showGuardForm, setShowGuardForm] = useState(false);
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [selectedGuardia, setSelectedGuardia] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [assignmentToEdit, setAssignmentToEdit] = useState(null);

    const token = getToken();

    useEffect(() => {
        fetchData();
    }, [refresh]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Iniciando fetchData...');
            
            // Cargar datos en paralelo
            const [guardsRes, bikeracksRes, assignmentsRes] = await Promise.allSettled([
                apiService.getGuards(token),
                apiService.getBikeracks(token),
                apiService.getGuardAssignments(token)
            ]);

            console.log('Resultados Promise.allSettled:', { guardsRes, bikeracksRes, assignmentsRes });

            // PROCESAR GUARDIAS
            if (guardsRes.status === 'fulfilled' && guardsRes.value?.success) {
                const guardsData = Array.isArray(guardsRes.value.data) ? guardsRes.value.data : [];
                console.log(`✅ ${guardsData.length} guardias cargados`);
                setGuardias(guardsData);
            } else {
                console.error('❌ Error en guards:', guardsRes.reason || guardsRes.value?.message);
                setGuardias([]);
            }

            // PROCESAR BICICLETEROS
            if (bikeracksRes.status === 'fulfilled' && bikeracksRes.value?.success) {
                const bikeracksData = Array.isArray(bikeracksRes.value.data) ? bikeracksRes.value.data : [];
                console.log(`✅ ${bikeracksData.length} bicicleteros cargados`);
                if (bikeracksData.length > 0) {
                    console.log('🔍 Primer bicicletero:', bikeracksData[0]);
                }
                setBikeracks(bikeracksData);
            } else {
                console.error('❌ Error en bikeracks:', bikeracksRes.reason || bikeracksRes.value?.message);
                setBikeracks([]);
            }

            // PROCESAR ASIGNACIONES
            if (assignmentsRes.status === 'fulfilled' && assignmentsRes.value?.success) {
                const assignmentsData = Array.isArray(assignmentsRes.value.data) ? assignmentsRes.value.data : [];
                console.log(`✅ ${assignmentsData.length} asignaciones cargadas`);
                if (assignmentsData.length > 0) {
                    console.log('🔍 Primera asignación:', assignmentsData[0]);
                }
                setAssignments(assignmentsData);
            } else {
                console.error('❌ Error en assignments:', assignmentsRes.reason || assignmentsRes.value?.message);
                setAssignments([]);
            }
     
        } catch (err) {
            console.error('❌ Error general en fetchData:', err);
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
            console.log('✅ fetchData completado');
        }
    };

    const handleCreateGuard = async (guardData) => {
        try {
            const cleanData = Object.fromEntries(
                Object.entries(guardData).filter(([_, v]) => v !== '')
            );

            const response = await apiService.createGuard(cleanData, token);
            
            if (response.success) {
                alert(`✅ Guardia creado exitosamente: ${response.data.guard.user.names}`);
                setShowGuardForm(false);
                setRefresh(prev => !prev);
            } else {
                alert(`❌ Error: ${response.message}`);
            }
        } catch (err) {
            console.error('Error creating guard:', err);
            alert('❌ Error al crear el guardia');
        }
    };

    const handleCreateAssignment = async (assignmentData) => {
        try {
            const response = await apiService.createAssignment(assignmentData, token);
            
            if (response.success) {
                alert('✅ Asignación creada exitosamente');
                setShowAssignmentForm(false);
                setSelectedGuardia(null);
                setRefresh(prev => !prev);
            } else {
                alert(`❌ Error: ${response.message}`);
            }
        } catch (err) {
            console.error('Error creating assignment:', err);
            alert('❌ Error al crear la asignación');
        }
    };

    const handleUpdateAssignment = async (assignmentData, assignmentId) => {
        try {
            const token = getToken();
            
           
            const result = await apiService.updateAssignment(assignmentId, assignmentData, token);
            
            if (result.success) {
                alert('✅ Asignación actualizada exitosamente');
                setShowAssignmentForm(false);
                setSelectedGuardia(null);
                setAssignmentToEdit(null);
                setRefresh(prev => !prev);
            } else {
                alert(`❌ Error: ${result.message}`);
            }
        } catch (err) {
            console.error('Error updating assignment:', err);
            alert('❌ Error al actualizar la asignación');
        }
    };

    const handleToggleAvailability = async (guardId, isAvailable) => {
        try {
            const response = await apiService.toggleGuardAvailability(
                guardId, 
                isAvailable, 
                token
            );
            
            if (response.success) {
                setRefresh(prev => !prev);
            } else {
                alert(`❌ Error: ${response.message}`);
            }
        } catch (err) {
            console.error('Error toggling availability:', err);
            alert('❌ Error al cambiar disponibilidad');
        }
    };

    const getGuardAssignments = (guardId) => {
        console.log(`\n=== BUSCANDO ASIGNACIONES PARA GUARDIA ${guardId} ===`);
        
        if (assignments.length === 0) {
            console.log('⚠️ No hay asignaciones en el estado');
            return [];
        }
        
        const filtered = assignments.filter(a => {
            // Normalizar el guardId de la asignación
            const assignmentGuardId = a.guardId || a.guard?.id;
            const match = parseInt(assignmentGuardId) === parseInt(guardId);
            return match;
        });
        
        console.log(`🎯 RESULTADO: ${filtered.length} asignaciones encontradas`);
        return filtered;
    };

    // ESTILOS
    const styles = {
        container: {
            padding: '25px',
            backgroundColor: '#242d4b',
            minHeight: 'calc(100vh - 80px)'
        },
        header: {
            color: '#ffffffff',
            marginBottom: '10px',
            fontSize: '32px',
            fontWeight: '700'
        },
        subtitle: {
            color: '#ffffffff',
            marginBottom: '30px',
            fontSize: '18px'
        },
        sectionTitle: {
            color: '#ebedf5ff',
            marginBottom: '20px',
            fontSize: '22px',
            fontWeight: '600',
            borderBottom: '2px solid #4361ee',
            paddingBottom: '8px',
            display: 'inline-block'
        },
        cardsContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '25px',
            marginTop: '20px'
        },
        card: {
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: '1px solid #eaeaea'
        },
        cardHeader: {
            background: 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)',
            color: 'white',
            padding: '20px',
            textAlign: 'center'
        },
        cardTitle: {
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '5px'
        },
        cardSubtitle: {
            fontSize: '14px',
            opacity: '0.9'
        },
        cardId: {
            fontSize: '12px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '3px 10px',
            borderRadius: '12px',
            display: 'inline-block',
            marginTop: '8px'
        },
        cardBody: {
            padding: '20px'
        },
        tabsContainer: {
            display: 'flex',
            borderBottom: '2px solid #f0f0f0',
            marginBottom: '20px'
        },
        tab: {
            flex: 1,
            textAlign: 'center',
            padding: '12px 0',
            cursor: 'pointer',
            fontWeight: '500',
            color: '#6c757d',
            transition: 'all 0.3s ease',
            borderBottom: '3px solid transparent',
            fontSize: '14px'
        },
        activeTab: {
            color: '#4361ee',
            borderBottom: '3px solid #4361ee',
            fontWeight: '600'
        },
        contentSection: {
            minHeight: '150px'
        },
        infoItem: {
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center'
        },
        infoLabel: {
            fontWeight: '600',
            color: '#272e4b',
            minWidth: '100px',
            fontSize: '14px'
        },
        infoValue: {
            color: '#495057',
            fontSize: '14px',
            wordBreak: 'break-word'
        },
        badge: {
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'inline-block'
        },
        badgeActive: {
            backgroundColor: '#e7f7ef',
            color: '#2a8c5a'
        },
        badgeInactive: {
            backgroundColor: '#fee',
            color: '#e74c3c'
        },
        button: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            fontSize: '14px',
            marginTop: '10px'
        },
        buttonPrimary: {
            backgroundColor: '#4361ee',
            color: 'white',
            width: '100%'
        },
        buttonSecondary: {
            backgroundColor: '#6c757d',
            color: 'white',
            width: '100%'
        },
        icon: {
            marginRight: '8px',
            fontSize: '16px'
        },
        loading: {
            textAlign: 'center',
            padding: '50px',
            color: '#4361ee'
        },
        error: {
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#fee',
            color: '#e74c3c',
            borderRadius: '8px',
            margin: '20px 0'
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        },
        modal: {
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        },
        modalTitle: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#272e4b'
        },
        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6c757d'
        },
        emptyState: {
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '40px',
            color: '#6c757d',
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }
    };

    const CardGuardia = ({ guardia }) => {
        const activeTab = activeCards[guardia.id] || 'informacion';
        const guardAssignments = getGuardAssignments(guardia.id);

        const handleTabClick = (tab) => {
            setActiveCards(prev => ({
                ...prev,
                [guardia.id]: tab
            }));
        };

        const formatSchedule = (assignments) => {
            if (!assignments || assignments.length === 0) return [];
            
            const daysMap = {
                0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miércoles',
                4: 'jueves', 5: 'viernes', 6: 'sábado'
            };
            
            return assignments.map(a => ({
                dia: daysMap[a.dayOfWeek] || `Día ${a.dayOfWeek}`,
                horario: `${a.startTime || '??:??'} - ${a.endTime || '??:??'}`,
                bicicletero: a.bikerack?.name || 'Sin nombre',
                id: a.id
            }));
        };

        const guardSchedule = formatSchedule(guardAssignments);

        return (
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>
                        {guardia.user?.names} {guardia.user?.lastName}
                    </div>
                    <div style={styles.cardSubtitle}>
                        Guardia #{guardia.guardNumber || guardia.id}
                    </div>
                    <div style={styles.cardId}>
                        ID: {guardia.id} | {guardAssignments.length} asignaciones
                    </div>
                </div>
                
                <div style={styles.cardBody}>
                    <div style={styles.tabsContainer}>
                        <div 
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'informacion' && styles.activeTab)
                            }}
                            onClick={() => handleTabClick('informacion')}
                        >
                            📋 Info
                        </div>
                        <div 
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'horario' && styles.activeTab)
                            }}
                            onClick={() => handleTabClick('horario')}
                        >
                            🕐 Horario ({guardSchedule.length})
                        </div>
                        <div 
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'contacto' && styles.activeTab)
                            }}
                            onClick={() => handleTabClick('contacto')}
                        >
                            📞 Contacto
                        </div>
                    </div>

                    <div style={styles.contentSection}>
                        {activeTab === 'informacion' && (
                            <div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Email:</span>
                                    <span style={styles.infoValue}>{guardia.user?.email}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>RUT:</span>
                                    <span style={styles.infoValue}>{guardia.user?.rut}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Estado:</span>
                                    <span style={{
                                        ...styles.badge,
                                        ...(guardia.isAvailable ? styles.badgeActive : styles.badgeInactive)
                                    }}>
                                        {guardia.isAvailable ? '✅ Disponible' : '❌ No disponible'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'horario' && (
                            <div>
                                {guardSchedule.length > 0 ? (
                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {guardSchedule.map((schedule, index) => (
                                            <div 
                                                key={schedule.id || index} 
                                                style={{
                                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    marginBottom: '8px',
                                                    borderLeft: '4px solid #4361ee',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    const fullAssignment = assignments.find(a => a.id === schedule.id);
                                                    if (fullAssignment) {
                                                        setSelectedGuardia(guardia);
                                                        setAssignmentToEdit(fullAssignment);
                                                        setShowAssignmentForm(true);
                                                    }
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ 
                                                        fontSize: '12px', 
                                                        backgroundColor: '#4361ee', 
                                                        color: 'white',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {schedule.dia}
                                                    </span>
                                                    <span style={{ fontWeight: '600', color: '#272e4b' }}>
                                                        {schedule.horario}
                                                    </span>
                                                    <span style={{ 
                                                        marginLeft: 'auto',
                                                        fontSize: '12px',
                                                        color: '#3498db'
                                                    }}>
                                                        ✏️ Editar
                                                    </span>
                                                </div>
                                                <div style={{ 
                                                    fontSize: '14px', 
                                                    color: '#495057',
                                                    marginTop: '5px'
                                                }}>
                                                    📍 {schedule.bicicletero}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '20px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ fontSize: '48px' }}>📅</div>
                                        <h4>Sin asignaciones</h4>
                                        <button 
                                            style={{ 
                                                ...styles.button, 
                                                ...styles.buttonPrimary,
                                                width: 'auto',
                                                marginTop: '15px'
                                            }}
                                            onClick={() => {
                                                setSelectedGuardia(guardia);
                                                setShowAssignmentForm(true);
                                            }}
                                        >
                                            + Asignar primer horario
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'contacto' && (
                            <div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Teléfono:</span>
                                    <span style={styles.infoValue}>{guardia.phone || 'No registrado'}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Dirección:</span>
                                    <span style={styles.infoValue}>{guardia.address || 'No registrada'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button 
                            style={{ ...styles.button, ...styles.buttonPrimary, flex: 1 }}
                            onClick={() => {
                                setSelectedGuardia(guardia);
                                setShowAssignmentForm(true);
                            }}
                        >
                            📅 Asignar Horario
                        </button>
                        <button 
                            style={{ 
                                ...styles.button, 
                                backgroundColor: guardia.isAvailable ? '#f39c12' : '#2ecc71',
                                color: 'white',
                                flex: 1
                            }}
                            onClick={() => handleToggleAvailability(guardia.id, !guardia.isAvailable)}
                        >
                            {guardia.isAvailable ? '🔴 Desactivar' : '🟢 Activar'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <LayoutAdmin>
                <div style={styles.container}>
                    <div style={styles.loading}>
                        <h2>Cargando datos...</h2>
                    </div>
                </div>
            </LayoutAdmin>
        );
    }

    return (
        <LayoutAdmin>
            <div style={styles.container}>
                <h1 style={styles.header}>Gestión de Guardias</h1>
                <p style={styles.subtitle}>
                    Total de guardias: {guardias.length} | Asignaciones activas: {assignments.length}
                </p>
                
                {error && <div style={styles.error}>{error}</div>}
                
                <h3 style={styles.sectionTitle}>Guardias Registrados</h3>
                
                <div style={styles.cardsContainer}>
                    {guardias.length > 0 ? (
                        guardias.map(guardia => (
                            <CardGuardia key={guardia.id} guardia={guardia} />
                        ))
                    ) : (
                        <div style={styles.emptyState}>
                            <h3>No hay guardias registrados</h3>
                            <button 
                                style={{ ...styles.button, ...styles.buttonPrimary, width: 'auto', margin: '50px' }}
                                onClick={() => setShowGuardForm(true)}
                            >
                                + Agregar Primer Guardia
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <button 
                        style={{ ...styles.button, ...styles.buttonPrimary, width: '200px' }}
                        onClick={() => setShowGuardForm(true)}
                    >
                        + Agregar Nuevo Guardia
                    </button>
                </div>
            </div>

            {showGuardForm && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Nuevo Guardia</h2>
                            <button 
                                style={styles.closeButton}
                                onClick={() => setShowGuardForm(false)}
                            >
                                ×
                            </button>
                        </div>
                        <GuardForm 
                            onSubmit={handleCreateGuard}
                            onCancel={() => setShowGuardForm(false)}
                        />
                    </div>
                </div>
            )}

            {showAssignmentForm && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                {assignmentToEdit ? '✏️ Editar' : '📅 Nueva'} Asignación - {selectedGuardia?.user?.names}
                            </h2>
                            <button 
                                style={styles.closeButton}
                                onClick={() => {
                                    setShowAssignmentForm(false);
                                    setSelectedGuardia(null);
                                    setAssignmentToEdit(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <AssignmentForm 
                            guardId={selectedGuardia?.id}
                            bikeracks={bikeracks}
                            onSubmit={assignmentToEdit ? 
                                (data) => handleUpdateAssignment(data, assignmentToEdit.id) : 
                                handleCreateAssignment}
                            onCancel={() => {
                                setShowAssignmentForm(false);
                                setSelectedGuardia(null);
                                setAssignmentToEdit(null);
                            }}
                            existingAssignments={assignments}
                            assignmentToEdit={assignmentToEdit}
                            onAssignmentUpdated={() => setRefresh(prev => !prev)}
                        />
                    </div>
                </div>
            )}
        </LayoutAdmin>
    );
};

};

export default GuardiasAdmin;