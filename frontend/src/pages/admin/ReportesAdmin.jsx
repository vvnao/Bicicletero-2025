"use strict";
import LayoutAdmin from "../../components/admin/LayoutAdmin";

function ReportesAdmin() {
    return (
        <LayoutAdmin>
            <div style={{ padding: '20px' }}>
                <h1 style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: '#ffffffff', 
                    marginBottom: '20px' 
                }}>
                    📊 Reportes del Sistema
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
                        marginBottom: '25px'
                    }}>
                        Genera, visualiza y descarga reportes detallados del sistema de bicicletero.
                    </p>
                    
                    {/* Filtros de reportes */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '20px',
                        borderRadius: '10px',
                        marginBottom: '30px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: '#374151',
                            marginBottom: '15px'
                        }}>
                            ⚙️ Configurar Reporte
                        </h3>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '15px'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#4b5563'
                                }}>
                                    Tipo de Reporte
                                </label>
                                <select style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: 'white'
                                }}>
                                    <option>Uso de Bicicletas</option>
                                    <option>Ingresos/Retiros</option>
                                    <option>Estado del Inventario</option>
                                    <option>Actividad de Usuarios</option>
                                    <option>Turnos de Guardias</option>
                                    <option>Incidentes Reportados</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#4b5563'
                                }}>
                                    Rango de Fechas
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="date" 
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #d1d5db'
                                        }}
                                    />
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#6b7280'
                                    }}>
                                        hasta
                                    </span>
                                    <input 
                                        type="date" 
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #d1d5db'
                                        }}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#4b5563'
                                }}>
                                    Formato
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button style={{
                                        flex: 1,
                                        padding: '10px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}>
                                        PDF
                                    </button>
                                    <button style={{
                                        flex: 1,
                                        padding: '10px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}>
                                        Excel
                                    </button>
                                    <button style={{
                                        flex: 1,
                                        padding: '10px',
                                        backgroundColor: '#8b5cf6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}>
                                        Gráfico
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <button style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            backgroundColor: '#1e40af',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            📄 Generar Reporte
                        </button>
                    </div>
                    
                    {/* Reportes predefinidos */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            color: '#1e40af',
                            marginBottom: '20px'
                        }}>
                            🚀 Reportes Rápidos
                        </h3>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '20px'
                        }}>
                            {[
                                {
                                    title: 'Reporte Diario',
                                    desc: 'Resumen de actividad del día actual',
                                    icon: '📅',
                                    color: '#3b82f6',
                                    stats: 'Hoy'
                                },
                                {
                                    title: 'Reporte Semanal',
                                    desc: 'Análisis de la última semana',
                                    icon: '📈',
                                    color: '#10b981',
                                    stats: 'Últimos 7 días'
                                },
                                {
                                    title: 'Reporte Mensual',
                                    desc: 'Estadísticas completas del mes',
                                    icon: '📊',
                                    color: '#8b5cf6',
                                    stats: 'Mes actual'
                                },
                                {
                                    title: 'Inventario Actual',
                                    desc: 'Estado completo del inventario',
                                    icon: '📋',
                                    color: '#f59e0b',
                                    stats: 'Actualizado hoy'
                                }
                            ].map((reporte, index) => (
                                <div key={index} style={{
                                    backgroundColor: 'white',
                                    border: `1px solid ${reporte.color}20`,
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                    transition: 'transform 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '15px'
                                    }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            backgroundColor: `${reporte.color}20`,
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '15px',
                                            fontSize: '24px',
                                            color: reporte.color
                                        }}>
                                            {reporte.icon}
                                        </div>
                                        <div>
                                            <h4 style={{
                                                margin: '0',
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                color: '#1f2937'
                                            }}>
                                                {reporte.title}
                                            </h4>
                                            <span style={{
                                                fontSize: '0.85rem',
                                                color: reporte.color,
                                                fontWeight: '500'
                                            }}>
                                                {reporte.stats}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <p style={{
                                        margin: '0 0 15px 0',
                                        color: '#6b7280',
                                        fontSize: '0.9rem'
                                    }}>
                                        {reporte.desc}
                                    </p>
                                    
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button style={{
                                            padding: '8px 16px',
                                            backgroundColor: `${reporte.color}20`,
                                            color: reporte.color,
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}>
                                            Ver Vista Previa
                                        </button>
                                        <button style={{
                                            padding: '8px 16px',
                                            backgroundColor: reporte.color,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}>
                                            Descargar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Historial de reportes */}
                    <div>
                        <h3 style={{
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            color: '#1e40af',
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>📜 Historial de Reportes Generados</span>
                            <span style={{
                                fontSize: '0.9rem',
                                color: '#6b7280',
                                fontWeight: 'normal'
                            }}>
                                Últimos 30 días
                            </span>
                        </h3>
                        
                        <div style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '10px',
                            overflow: 'hidden'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse'
                            }}>
                                <thead>
                                    <tr style={{
                                        backgroundColor: '#e5e7eb'
                                    }}>
                                        <th style={{
                                            padding: '15px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            color: '#374151'
                                        }}>Fecha</th>
                                        <th style={{
                                            padding: '15px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            color: '#374151'
                                        }}>Tipo de Reporte</th>
                                        <th style={{
                                            padding: '15px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            color: '#374151'
                                        }}>Generado Por</th>
                                        <th style={{
                                            padding: '15px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            color: '#374151'
                                        }}>Formato</th>
                                        <th style={{
                                            padding: '15px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            color: '#374151'
                                        }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { fecha: '15/11/2024', tipo: 'Uso de Bicicletas', usuario: 'admin', formato: 'PDF', tamaño: '2.4 MB' },
                                        { fecha: '14/11/2024', tipo: 'Inventario Mensual', usuario: 'admin', formato: 'Excel', tamaño: '1.8 MB' },
                                        { fecha: '12/11/2024', tipo: 'Actividad de Guardias', usuario: 'guardia1', formato: 'PDF', tamaño: '1.2 MB' },
                                        { fecha: '10/11/2024', tipo: 'Reporte de Incidentes', usuario: 'admin', formato: 'PDF', tamaño: '3.1 MB' },
                                        { fecha: '08/11/2024', tipo: 'Estadísticas Semanales', usuario: 'admin', formato: 'Gráfico', tamaño: '850 KB' },
                                    ].map((reporte, index) => (
                                        <tr key={index} style={{
                                            borderBottom: '1px solid #e5e7eb',
                                            backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                                        }}>
                                            <td style={{ padding: '15px' }}>{reporte.fecha}</td>
                                            <td style={{ padding: '15px' }}>{reporte.tipo}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    backgroundColor: '#dbeafe',
                                                    color: '#1e40af',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {reporte.usuario}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    backgroundColor: 
                                                        reporte.formato === 'PDF' ? '#fee2e2' :
                                                        reporte.formato === 'Excel' ? '#dcfce7' :
                                                        '#f3e8ff',
                                                    color: 
                                                        reporte.formato === 'PDF' ? '#991b1b' :
                                                        reporte.formato === 'Excel' ? '#065f46' :
                                                        '#6d28d9',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {reporte.formato}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#3b82f6',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        📥 Descargar
                                                    </button>
                                                    <button style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#6b7280',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer'
                                                    }}>
                                                        🗑️ Eliminar
                                                    </button>
                                                </div>
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

export default ReportesAdmin;