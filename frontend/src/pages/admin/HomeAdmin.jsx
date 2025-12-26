"use strict";
import { useNavigate } from "react-router-dom";
import { logout } from "@services/auth.service.js";
import { useState, useEffect } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";

function HomeAdmin() {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.backgroundColor = '#272e4b';
        
        return () => {
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.body.style.backgroundColor = '';
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/auth/login", { replace: true });
    };

    // Funciones de navegación
    const navigateToBicicletas = () => {
        navigate("/home/admin/bicicletas");
    };

    const navigateToGuardias = () => {
        navigate("/home/admin/guardias");
    };

    const navigateToHistorial = () => {
        navigate("/home/admin/historial");
    };

    const navigateToReportes = () => {
        navigate("/home/admin/reportes");
    };

    return (
        <LayoutAdmin>
            {/* Contenido principal */}
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', margin: 0 }}>
                {/* Header Sección */}
                <div style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: '30px', 
                    padding: '25px', 
                    backgroundColor: '#5a77df', 
                    borderRadius: '15px', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                    <div style={{flex: 1}}>
                        <h2 style={{
                            fontSize: '2.2rem', 
                            fontWeight: 'bold', 
                            color: '#ffffffff', 
                            margin: '0 0 10px 0'
                        }}>
                            ¡Buen día, Administrador!
                        </h2>
                        <p style={{
                            fontSize: '1.1rem', 
                            color: '#c3cbdaff', 
                            fontStyle: 'italic', 
                            margin: 0
                        }}>
                            - Que tengas un excelente {new Date().toLocaleDateString('es-ES', { weekday: 'long' })} -
                        </p>
                    </div>
                    <div style={{flex: 1, textAlign: 'right'}}>
                        <div style={{
                            backgroundColor: '#3d539f', 
                            padding: '18px', 
                            borderRadius: '10px', 
                            display: 'inline-block', 
                            border: '1px solid #e5e7eb'
                        }}>
                            <h4 style={{
                                margin: '0 0 12px 0', 
                                color: '#ffffffff', 
                                fontSize: '1.2rem', 
                                fontWeight: 'bold'
                            }}>
                                Admin del Sistema
                            </h4>
                            <p style={{
                                margin: '6px 0', 
                                color: '#e3e8f0ff', 
                                fontSize: '0.95rem'
                            }}>
                                Bicicletero UBB - Concepción, Chile
                            </p>
                            <p style={{
                                margin: '6px 0', 
                                color: '#e0e4eeff', 
                                fontSize: '0.95rem'
                            }}>
                                Fecha: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                    gap: '25px', 
                    marginBottom: '35px'
                }}>
                    {[
                        { 
                            number: '27', 
                            label: 'Bicicletas Registradas', 
                            tag: '#Estacionamiento', 
                            color: '#3b82f6',
                            icon: '🚲',
                            path: '/home/admin/bicicletas'
                        },
                        { 
                            number: '15', 
                            label: 'Usuarios Activos', 
                            tag: '#Sistema', 
                            color: '#10b981',
                            icon: '👥',
                            path: '/home/admin/usuarios'
                        },
                        { 
                            number: '8', 
                            label: 'Guardias Activos', 
                            tag: '#Turnos', 
                            color: '#f59e0b',
                            icon: '👮',
                            path: '/home/admin/guardias'
                        },
                        { 
                            number: '3', 
                            label: 'Reportes Pendientes', 
                            tag: '#Soporte', 
                            color: '#ef4444',
                            icon: '📋',
                            path: '/home/admin/reportes'
                        }
                    ].map((stat, index) => (
                        <div 
                            key={index} 
                            style={{
                                backgroundColor: '#484f6b', 
                                padding: '25px', 
                                borderRadius: '15px', 
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
                                textAlign: 'center', 
                                borderLeft: `5px solid ${stat.color}`, 
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onClick={() => stat.path && navigate(stat.path)}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(235, 226, 226, 0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                            }}
                        >
                            <div style={{
                                fontSize: '2.5rem',
                                marginBottom: '10px'
                            }}>
                                {stat.icon}
                            </div>
                            <h3 style={{
                                fontSize: '3rem', 
                                fontWeight: 'bold', 
                                color: '#efeff0ff', 
                                margin: '0 0 15px 0'
                            }}>
                                {stat.number}
                            </h3>
                            <p style={{
                                fontSize: '1rem', 
                                color: '#ecedf0ff', 
                                margin: '0 0 15px 0', 
                                fontWeight: '500'
                            }}>
                                {stat.label}
                            </p>
                            <span style={{
                                backgroundColor: `${stat.color}15`, 
                                color: stat.color, 
                                padding: '6px 12px', 
                                borderRadius: '20px', 
                                fontSize: '0.85rem', 
                                fontWeight: 'bold'
                            }}>
                                {stat.tag}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Sección de acciones rápidas */}
                <div style={{
                    backgroundColor: '#484f6b', 
                    padding: '25px', 
                    borderRadius: '15px', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    marginBottom: '30px'
                }}>
                    <h3 style={{
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: '#f8f8f8ff', 
                        margin: '0 0 20px 0'
                    }}>
                        Acciones Rápidas
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        <button
                            onClick={navigateToBicicletas}
                            style={{
                                padding: '15px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                            🚲 Gestionar Bicicletas
                        </button>
                        <button
                            onClick={navigateToGuardias}
                            style={{
                                padding: '15px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                        >
                            👮 Gestionar Guardias
                        </button>
                        <button
                            onClick={navigateToHistorial}
                            style={{
                                padding: '15px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                        >
                            📊 Ver Historial
                        </button>
                        <button
                            onClick={navigateToReportes}
                            style={{
                                padding: '15px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                        >
                            📋 Generar Reportes
                        </button>
                    </div>
                </div>

                {/* Información adicional */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '25px'
                }}>
                    <div style={{
                        backgroundColor: '#484f6b', 
                        padding: '25px', 
                        borderRadius: '15px', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        <h4 style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: '#fdfdfdff',
                            margin: '0 0 15px 0'
                        }}>
                            📈 Estadísticas del Día
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0,color: '#fdfdfdff' }}>
                            <li style={{ padding: '8px 0', borderBottom: '1px solid #62708bff' }}>
                                <span style={{ fontWeight: 'bold' }}>Ingresos hoy:</span> 12 bicicletas
                            </li>
                            <li style={{ padding: '8px 0', borderBottom: '1px solid #62708bff' }}>
                                <span style={{ fontWeight: 'bold' }}>Retiros hoy:</span> 8 bicicletas
                            </li>
                            <li style={{ padding: '8px 0', borderBottom: '1px solid #62708bff' }}>
                                <span style={{ fontWeight: 'bold' }}>Espacios disponibles:</span> 42/50
                            </li>
                            <li style={{ padding: '8px 0' }}>
                                <span style={{ fontWeight: 'bold' }}>Incidentes reportados:</span> 0
                            </li>
                        </ul>
                    </div>

                    <div style={{
                        backgroundColor: '#484f6b', 
                        padding: '25px', 
                        borderRadius: '15px', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        <h4 style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: '#ffffffff',
                            margin: '0 0 15px 0'
                        }}>
                            🔔 Recordatorios
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0,color: '#fdfdfdff' }}>
                            <li style={{ padding: '8px 0', borderBottom: '1px solid #62708bff' }}>
                                • Revisar mantenimiento de racks
                            </li>
                            <li style={{ padding: '8px 0', borderBottom: '1px solid #62708bff' }}>
                                • Verificar inventario de candados
                            </li>
                            <li style={{ padding: '8px 0', borderBottom: '1px solid #62708bff' }}>
                                • Enviar reporte semanal
                            </li>
                            <li style={{ padding: '8px 0' }}>
                                • Programar rotación de guardias
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </LayoutAdmin>
    );
}

export default HomeAdmin;