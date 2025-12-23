"use strict";
import { useState } from 'react';
import LayoutAdmin from "../../components/admin/LayoutAdmin";

const GuardiasAdmin = () => {
    const [activeCards, setActiveCards] = useState({});

    const handleTabClick = (guardiaId, tab) => {
        setActiveCards(prev => ({
            ...prev,
            [guardiaId]: tab
        }));
    };

    const styles = {
        container: {
            padding: '25px',
            backgroundColor: '#f5f7fa',
            minHeight: 'calc(100vh - 80px)'
        },
        header: {
            color: '#272e4b',
            marginBottom: '10px',
            fontSize: '32px',
            fontWeight: '700'
        },
        subtitle: {
            color: '#6c757d',
            marginBottom: '30px',
            fontSize: '18px'
        },
        sectionTitle: {
            color: '#272e4b',
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
            fontSize: '14px'
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
        }
    };

    // Datos de ejemplo para los guardias
    const guardias = [
        {
            id: 'g001',
            nombre: 'Juan Pérez',
            puesto: 'Guardia Principal',
            turno: 'Matutino',
            horario: '06:00 - 14:00',
            experiencia: '5 años',
            telefono: '+1 234 567 890',
            email: 'juan@bicicletero.com',
            estado: 'active',
            observaciones: 'Excelente desempeño, puntual'
        },
        {
            id: 'g002',
            nombre: 'María López',
            puesto: 'Guardia de Turno',
            turno: 'Vespertino',
            horario: '14:00 - 22:00',
            experiencia: '3 años',
            telefono: '+1 234 567 891',
            email: 'maria@bicicletero.com',
            estado: 'active',
            observaciones: 'Especialista en sistemas electrónicos'
        },
        {
            id: 'g003',
            nombre: 'Carlos Rodríguez',
            puesto: 'Guardia Nocturno',
            turno: 'Nocturno',
            horario: '22:00 - 06:00',
            experiencia: '7 años',
            telefono: '+1 234 567 892',
            email: 'carlos@bicicletero.com',
            estado: 'inactive',
            observaciones: 'Licencia médica hasta 01/02/2024'
        },
        {
            id: 'g004',
            nombre: 'Ana Martínez',
            puesto: 'Guardia de Relevo',
            turno: 'Matutino',
            horario: '06:00 - 14:00',
            experiencia: '2 años',
            telefono: '+1 234 567 893',
            email: 'ana@bicicletero.com',
            estado: 'active',
            observaciones: 'Recién capacitada en primeros auxilios'
        }
    ];

    const CardGuardia = ({ guardia }) => {
        const activeTab = activeCards[guardia.id] || 'informacion';

        return (
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>{guardia.nombre}</div>
                    <div style={styles.cardSubtitle}>{guardia.puesto}</div>
                    <div style={styles.cardId}>ID: {guardia.id.toUpperCase()}</div>
                </div>
                
                <div style={styles.cardBody}>
                    <div style={styles.tabsContainer}>
                        <div 
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'informacion' && styles.activeTab)
                            }}
                            onClick={() => handleTabClick(guardia.id, 'informacion')}
                        >
                            📋 Info
                        </div>
                        <div 
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'horario' && styles.activeTab)
                            }}
                            onClick={() => handleTabClick(guardia.id, 'horario')}
                        >
                            🕐 Horario
                        </div>
                        <div 
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'contacto' && styles.activeTab)
                            }}
                            onClick={() => handleTabClick(guardia.id, 'contacto')}
                        >
                            📞 Contacto
                        </div>
                    </div>

                    <div style={styles.contentSection}>
                        {activeTab === 'informacion' && (
                            <div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Turno:</span>
                                    <span style={styles.infoValue}>{guardia.turno}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Experiencia:</span>
                                    <span style={styles.infoValue}>{guardia.experiencia}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Estado:</span>
                                    <span style={{
                                        ...styles.badge,
                                        ...(guardia.estado === 'active' ? styles.badgeActive : styles.badgeInactive)
                                    }}>
                                        {guardia.estado === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Observaciones:</span>
                                    <span style={styles.infoValue}>{guardia.observaciones}</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'horario' && (
                            <div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Horario:</span>
                                    <span style={styles.infoValue}>{guardia.horario}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Días laborales:</span>
                                    <span style={styles.infoValue}>Lunes a Viernes</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Próximo turno:</span>
                                    <span style={styles.infoValue}>Mañana, 06:00</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Turnos/mes:</span>
                                    <span style={styles.infoValue}>22</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contacto' && (
                            <div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Teléfono:</span>
                                    <span style={styles.infoValue}>{guardia.telefono}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Email:</span>
                                    <span style={styles.infoValue}>{guardia.email}</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Dirección:</span>
                                    <span style={styles.infoValue}>Av. Principal #123</span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Contacto emergencia:</span>
                                    <span style={styles.infoValue}>+1 234 567 999</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <button style={{ ...styles.button, ...styles.buttonPrimary }}>
                        <span style={styles.icon}>✏️</span> Editar Guardia
                    </button>
                </div>
            </div>
        );
    };

    return (
        <LayoutAdmin>
            <div style={styles.container}>
                <h1 style={styles.header}>Bicicletero App</h1>
                <p style={styles.subtitle}>Sistema de gestión de guardias</p>
                
                <h3 style={styles.sectionTitle}>Seleccione el guardia:</h3>
                
                <div style={styles.cardsContainer}>
                    {guardias.map(guardia => (
                        <CardGuardia key={guardia.id} guardia={guardia} />
                    ))}
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <button style={{ ...styles.button, ...styles.buttonPrimary, width: '200px', marginRight: '10px' }}>
                        + Agregar Nuevo Guardia
                    </button>
                    <button style={{ ...styles.button, ...styles.buttonSecondary, width: '200px' }}>
                        📊 Ver Reportes
                    </button>
                </div>
            </div>
        </LayoutAdmin>
    );
};

export default GuardiasAdmin;