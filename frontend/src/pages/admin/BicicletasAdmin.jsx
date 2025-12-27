"use strict";
import { useState, useEffect } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import { useNavigate } from "react-router-dom";
import bikerackService from "../../services/bikerack.service";
import { getAuthToken, getUserData, isAdminOrGuard } from '../../helpers/authHelper';

function BicicletasAdmin() {
    const navigate = useNavigate();
    
    const [bicicleteros, setBicicleteros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bicicleteroSeleccionado, setBicicleteroSeleccionado] = useState(null);

    // Colores para cada ubicación
    const coloresPorNombre = {
        'NORTE': { colorContenedor: '#3B82F6', colorSombra: '#1D4ED8' },
        'SUR': { colorContenedor: '#10B981', colorSombra: '#047857' },
        'ESTE': { colorContenedor: '#fade77', colorSombra: '#c7b162' },
        'OESTE': { colorContenedor: '#EF4444', colorSombra: '#DC2626' },
        'CENTRAL': { colorContenedor: '#8B5CF6', colorSombra: '#7C3AED' }
    };

    // Datos mock SOLO si falla el backend
    const datosMockBicicleteros = [
        {
            id: 1,
            name: 'CENTRAL',
            capacity: 40,
            occupied: 25,
            free: 15,
            occupationPercentage: 63,
            status: 'Activo',
            colorContenedor: '#8B5CF6',
            colorSombra: '#7C3AED'
        },
        {
            id: 2,
            name: 'NORTE',
            capacity: 40,
            occupied: 18,
            free: 22,
            occupationPercentage: 45,
            status: 'Activo',
            colorContenedor: '#3B82F6',
            colorSombra: '#1D4ED8'
        },
        {
            id: 3,
            name: 'SUR',
            capacity: 40,
            occupied: 35,
            free: 5,
            occupationPercentage: 88,
            status: 'Casi Lleno',
            colorContenedor: '#10B981',
            colorSombra: '#047857'
        },
        {
            id: 4,
            name: 'ESTE',
            capacity: 40,
            occupied: 10,
            free: 30,
            occupationPercentage: 25,
            status: 'Activo',
            colorContenedor: '#fade77',
            colorSombra: '#c7b162'
        }
    ];

    // Función para extraer datos del backend (maneja diferentes formatos)
    const extraerDatosBackend = (datosReales) => {
        if (Array.isArray(datosReales)) {
            return datosReales;
        } 
        if (datosReales?.data && Array.isArray(datosReales.data)) {
            return datosReales.data;
        }
        if (datosReales?.success && Array.isArray(datosReales.data)) {
            return datosReales.data;
        }
        throw new Error('Estructura de datos inesperada');
    };

    // Formatear datos con colores
    const formatearBicicleteros = (datos) => {
  return datos.map(bicicletero => {
    const nombre = bicicletero.name || bicicletero.nombre || 'CENTRAL';
    const nombreUpper = nombre.toUpperCase();
    const colores = coloresPorNombre[nombreUpper] || coloresPorNombre['CENTRAL'];
    
    // Usa occupied (reservas activas) en lugar de usedCapacity
    const ocupado = bicicletero.occupied || bicicletero.usedCapacity || 0;
    const capacidad = bicicletero.capacity || bicicletero.capacidad || 40;
    const libre = bicicletero.free || bicicletero.availableCapacity || capacidad;
    const porcentaje = bicicletero.occupationPercentage || 
                      bicicletero.porcentajeOcupacion || 
                      (capacidad > 0 ? Math.round((ocupado / capacidad) * 100) : 0);
    
    return {
      id: bicicletero.id,
      name: nombre,
      nombre: nombre,
      capacidad: capacidad,
      occupied: ocupado, // ← Reservas activas
      free: libre,
      occupationPercentage: porcentaje,
      status: bicicletero.status || bicicletero.estado || 'Activo',
      colorContenedor: colores.colorContenedor,
      colorSombra: colores.colorSombra,
      espaciosDisponibles: libre
    };
  });
};

    // Cargar datos del backend
    const cargarDatosBackend = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Intentando cargar datos del backend...');
            
            // El servicio DEBE manejar el token internamente
            const datosReales = await bikerackService.getAll();
            
            const datosProcesados = extraerDatosBackend(datosReales);
            const bicicleterosFormateados = formatearBicicleteros(datosProcesados);
            
            setBicicleteros(bicicleterosFormateados);
            
            if (bicicleterosFormateados.length > 0) {
                setBicicleteroSeleccionado(bicicleterosFormateados[0]);
            }
            
            setLoading(false);
            
        } catch (error) {
            console.error('❌ Error al cargar del backend:', error);
            
            // Usar datos mock como fallback
            console.log('🔄 Usando datos de demostración');
            setError(`No se pudo conectar al servidor: ${error.message}`);
            setBicicleteros(datosMockBicicleteros);
            setBicicleteroSeleccionado(datosMockBicicleteros[0]);
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('🚀 BicicletasAdmin montado');
        
        const token = getAuthToken();
        const user = getUserData();
        
        console.log('🔐 Token:', token ? '✅ Presente' : '❌ Ausente');
        console.log('👤 Usuario:', user);
        
        if (!token || !user) {
            console.log('❌ No autenticado - Redirigiendo a login');
            navigate('/auth/login');
            return;
        }
        
        if (!isAdminOrGuard()) {
            alert('Acceso restringido a administradores y guardias');
            navigate('/');
            return;
        }
        
        console.log('✅ Usuario autorizado, cargando datos...');
        cargarDatosBackend();
        
    }, [navigate]);

    // Manejar selección de bicicletero
    const handleSeleccionarBicicletero = (bicicletero) => {
        setBicicleteroSeleccionado(bicicletero);
    };

    // Manejar recarga de datos
    const handleRecargar = () => {
        cargarDatosBackend();
    };

    // Renderizar estados de carga
    if (loading) {
        return (
            <LayoutAdmin>
                <div style={{ 
                    padding: '60px 20px', 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px'
                }}>
                    <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        border: '5px solid #f3f3f3',
                        borderTop: '5px solid #3B82F6',
                        borderRadius: '50%',
                        marginBottom: '20px',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <div style={{ 
                        fontSize: '1.2rem', 
                        color: '#6B7280',
                        marginBottom: '10px'
                    }}>
                        Conectando con el servidor...
                    </div>
                    <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#9CA3AF'
                    }}>
                        Obteniendo datos en tiempo real
                    </div>
                </div>
            </LayoutAdmin>
        );
    }

    // Determinar color de estado
    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'Lleno': return '#DC2626';
            case 'Casi Lleno': return '#F59E0B';
            case 'Activo': return '#10B981';
            default: return '#6B7280';
        }
    };

    return (
        <LayoutAdmin>
            <div style={{ padding: '20px' }}>
                
                {/* Encabezado */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            color: '#333',
                            margin: 0
                        }}>
                            {error ? 'DATOS DE DEMOSTRACIÓN' : 'BICICLETEROS EN TIEMPO REAL'}
                        </h1>
                        {error && (
                            <p style={{ margin: '5px 0 0 0', color: '#F59E0B', fontSize: '0.9rem' }}>
                                {error}
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handleRecargar}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#F3F4F6',
                                color: '#4B5563',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#E5E7EB'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                        >
                            <span>↻</span> Actualizar
                        </button>
                        <div style={{
                            padding: '8px 16px',
                            backgroundColor: '#F0F9FF',
                            color: '#0369A1',
                            border: '1px solid #BAE6FD',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            Total: {bicicleteros.length} bicicleteros
                        </div>
                    </div>
                </div>
                
                {/* Contenedor de bicicleteros */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '30px',
                    marginBottom: '30px',
                    flexWrap: 'wrap'
                }}>
                    {bicicleteros.map((bicicletero) => {
                        const isActive = bicicleteroSeleccionado?.id === bicicletero.id;
                        
                        return (
                            <div 
                                key={bicicletero.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onClick={() => handleSeleccionarBicicletero(bicicletero)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{
                                    position: 'relative',
                                    width: '160px',
                                    height: '160px',
                                    marginBottom: '15px'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '6px',
                                        left: '6px',
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: bicicletero.colorSombra,
                                        borderRadius: '15px'
                                    }}></div>
                                    
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: bicicletero.colorContenedor,
                                        borderRadius: '15px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '20px',
                                        border: isActive ? '3px solid white' : 'none',
                                        boxShadow: isActive ? '0 0 0 2px #333, 0 10px 20px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div style={{
                                            fontSize: '2.5rem',
                                            fontWeight: 'bold',
                                            color: 'white',
                                            marginBottom: '8px'
                                        }}>
                                            🚲
                                        </div>
                                        
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: 'white',
                                            backgroundColor: 'rgba(0,0,0,0.2)',
                                            padding: '3px 10px',
                                            borderRadius: '10px',
                                            fontWeight: '600'
                                        }}>
                                            {bicicletero.occupationPercentage}%
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '1.3rem',
                                        fontWeight: 'bold',
                                        color: isActive ? bicicletero.colorContenedor : '#333',
                                        textTransform: 'uppercase',
                                        marginBottom: '5px'
                                    }}>
                                        {bicicletero.name}
                                    </div>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: '#6B7280',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px'
                                    }}>
                                        <div>{bicicletero.occupied}/{bicicletero.capacidad}</div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: getEstadoColor(bicicletero.status)
                                        }}>
                                            {bicicletero.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tabla de detalles */}
                {bicicleteroSeleccionado && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        marginTop: '20px',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <div style={{
                            padding: '18px 24px',
                            backgroundColor: bicicleteroSeleccionado.colorContenedor,
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{
                                fontSize: '1.3rem',
                                fontWeight: 'bold',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{ 
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    padding: '5px 10px',
                                    borderRadius: '6px'
                                }}>
                                    🚲
                                </span>
                                Bicicletero {bicicleteroSeleccionado.id} - {bicicleteroSeleccionado.name}
                            </h2>
                            <div style={{
                                fontSize: '0.9rem',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontWeight: '500'
                            }}>
                                ID: {bicicleteroSeleccionado.id}
                            </div>
                        </div>
                        
                        <div style={{ padding: '20px' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '20px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    backgroundColor: '#F9FAFB',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${bicicleteroSeleccionado.colorContenedor}`
                                }}>
                                    <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Capacidad Total</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                                        {bicicleteroSeleccionado.capacidad} espacios
                                    </div>
                                </div>
                                
                                <div style={{
                                    backgroundColor: '#F9FAFB',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${bicicleteroSeleccionado.colorContenedor}`
                                }}>
                                    <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Espacios Ocupados</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DC2626' }}>
                                        {bicicleteroSeleccionado.occupied} bicicletas
                                    </div>
                                </div>
                                
                                <div style={{
                                    backgroundColor: '#F9FAFB',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${bicicleteroSeleccionado.colorContenedor}`
                                }}>
                                    <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Espacios Libres</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>
                                        {bicicleteroSeleccionado.free} espacios
                                    </div>
                                </div>
                                
                                <div style={{
                                    backgroundColor: '#F9FAFB',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${bicicleteroSeleccionado.colorContenedor}`
                                }}>
                                    <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Porcentaje Ocupación</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8B5CF6' }}>
                                        {bicicleteroSeleccionado.occupationPercentage}%
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{
                                width: '100%',
                                height: '8px',
                                backgroundColor: '#E5E7EB',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginTop: '10px'
                            }}>
                                <div style={{
                                    width: `${bicicleteroSeleccionado.occupationPercentage}%`,
                                    height: '100%',
                                    backgroundColor: bicicleteroSeleccionado.colorContenedor,
                                    transition: 'width 0.5s ease'
                                }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </LayoutAdmin>
    );
}

export default BicicletasAdmin;