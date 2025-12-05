"use strict";
import LayoutAdmin from "../../components/admin/LayoutAdmin";

function BicicletasAdmin() {
    return (
        <LayoutAdmin>
            <div style={{ padding: '20px' }}>
                <h1 style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: '#1e40af', 
                    marginBottom: '20px' 
                }}>
                    🚲 Gestión de Bicicletas
                </h1>
                
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    padding: '25px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    marginBottom: '30px'
                }}>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#6b7280',
                        marginBottom: '20px'
                    }}>
                        Aquí puedes gestionar todas las bicicletas del sistema, registrar nuevas, 
                        consultar el estado y administrar el inventario.
                    </p>
                    
                    {/* Sección de estadísticas */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            backgroundColor: '#f0f9ff',
                            padding: '20px',
                            borderRadius: '10px',
                            borderLeft: '5px solid #3b82f6'
                        }}>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: '#1e40af'
                            }}>
                                42
                            </div>
                            <div style={{
                                color: '#6b7280',
                                fontSize: '0.9rem'
                            }}>
                                Bicicletas Totales
                            </div>
                        </div>
                        
                        <div style={{
                            backgroundColor: '#f0fdf4',
                            padding: '20px',
                            borderRadius: '10px',
                            borderLeft: '5px solid #10b981'
                        }}>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: '#065f46'
                            }}>
                                36
                            </div>
                            <div style={{
                                color: '#6b7280',
                                fontSize: '0.9rem'
                            }}>
                                Disponibles
                            </div>
                        </div>
                        
                        <div style={{
                            backgroundColor: '#fef3c7',
                            padding: '20px',
                            borderRadius: '10px',
                            borderLeft: '5px solid #f59e0b'
                        }}>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: '#92400e'
                            }}>
                                6
                            </div>
                            <div style={{
                                color: '#6b7280',
                                fontSize: '0.9rem'
                            }}>
                                En Uso
                            </div>
                        </div>
                        
                        <div style={{
                            backgroundColor: '#fef2f2',
                            padding: '20px',
                            borderRadius: '10px',
                            borderLeft: '5px solid #ef4444'
                        }}>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: '#991b1b'
                            }}>
                                2
                            </div>
                            <div style={{
                                color: '#6b7280',
                                fontSize: '0.9rem'
                            }}>
                                En Mantenimiento
                            </div>
                        </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginBottom: '30px',
                        flexWrap: 'wrap'
                    }}>
                        <button style={{
                            padding: '12px 24px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                            ➕ Registrar Nueva Bicicleta
                        </button>
                        
                        <button style={{
                            padding: '12px 24px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                        >
                            📋 Ver Inventario Completo
                        </button>
                        
                        <button style={{
                            padding: '12px 24px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                        >
                            🔧 Reportar Mantenimiento
                        </button>
                    </div>
                    
                    {/* Tabla de ejemplo */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px',
                        padding: '20px',
                        marginTop: '20px'
                    }}>
                        <h3 style={{
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            color: '#1e40af',
                            marginBottom: '15px'
                        }}>
                            Últimas Bicicletas Registradas
                        </h3>
                        
                        <div style={{
                            overflowX: 'auto'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse'
                            }}>
                                <thead>
                                    <tr style={{
                                        backgroundColor: '#e5e7eb',
                                        borderBottom: '2px solid #d1d5db'
                                    }}>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'left',
                                            color: '#374151',
                                            fontWeight: 'bold'
                                        }}>ID</th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'left',
                                            color: '#374151',
                                            fontWeight: 'bold'
                                        }}>Marca/Modelo</th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'left',
                                            color: '#374151',
                                            fontWeight: 'bold'
                                        }}>Estado</th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'left',
                                            color: '#374151',
                                            fontWeight: 'bold'
                                        }}>Ubicación</th>
                                        <th style={{
                                            padding: '12px',
                                            textAlign: 'left',
                                            color: '#374151',
                                            fontWeight: 'bold'
                                        }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { id: 'BIC-001', marca: 'Trek Marlin 5', estado: 'Disponible', ubicacion: 'Rack A-12' },
                                        { id: 'BIC-002', marca: 'Specialized Rockhopper', estado: 'En Uso', ubicacion: 'Rack B-03' },
                                        { id: 'BIC-003', marca: 'Giant Talon 3', estado: 'Mantenimiento', ubicacion: 'Taller' },
                                        { id: 'BIC-004', marca: 'Scott Aspect 950', estado: 'Disponible', ubicacion: 'Rack C-07' },
                                        { id: 'BIC-005', marca: 'Cannondale Trail 8', estado: 'Disponible', ubicacion: 'Rack A-05' },
                                    ].map((bici, index) => (
                                        <tr key={index} style={{
                                            borderBottom: '1px solid #e5e7eb',
                                            backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                                        }}>
                                            <td style={{ padding: '12px' }}>{bici.id}</td>
                                            <td style={{ padding: '12px' }}>{bici.marca}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold',
                                                    backgroundColor: 
                                                        bici.estado === 'Disponible' ? '#d1fae5' :
                                                        bici.estado === 'En Uso' ? '#fef3c7' :
                                                        '#fecaca',
                                                    color: 
                                                        bici.estado === 'Disponible' ? '#065f46' :
                                                        bici.estado === 'En Uso' ? '#92400e' :
                                                        '#991b1b'
                                                }}>
                                                    {bici.estado}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>{bici.ubicacion}</td>
                                            <td style={{ padding: '12px' }}>
                                                <button style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    marginRight: '8px'
                                                }}>
                                                    Editar
                                                </button>
                                                <button style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer'
                                                }}>
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutAdmin>
    );
}

export default BicicletasAdmin;